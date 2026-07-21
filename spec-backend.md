# 🖥️ SPEC 1: Backend API & Database (Developer A — Backend)
## ePondo — Local Governance Financial Compliance System

> **Owner:** Developer A (Backend)  
> **Stack:** Node.js (Fastify) + PostgreSQL + Redis  
> **Runs on:** Laptop 1  
> **Dependencies on others:** None (provides APIs consumed by Laptops 2 & 3)  
> **Coordination:** Exposes REST API on `http://localhost:3000` — share via ngrok or LAN IP

---

## Scope

This spec covers:
- Database schema creation & migrations
- All REST API endpoints (internal)
- Government API integration services (server-to-server)
- Business logic: state machine, statutory cap enforcement, token management
- Background jobs: DBM COMPASS polling, notification dispatch

This spec does NOT cover:
- Frontend UI (Spec 2)
- Citizen module frontend & AI chatbot (Spec 3)

---

## Task 1: Project Scaffolding & Database Setup

### 1.1 Initialize Project

```bash
mkdir epondo-api && cd epondo-api
npm init -y
npm install fastify @fastify/cors @fastify/jwt @fastify/cookie
npm install pg knex dotenv axios redis bullmq uuid
npm install -D typescript @types/node tsx nodemon
```

### 1.2 Environment Variables (.env)

```env
# Server
PORT=3000
NODE_ENV=development
JWT_SECRET=your-jwt-secret

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/epondo

# Redis
REDIS_URL=redis://localhost:6379

# Local authentication uses PostgreSQL password hashes and JWTs.

# NationalID eVerify
EVERIFY_BASE_URL=https://api.nationalid.egov.ph
EVERIFY_CLIENT_ID=your_client_id
EVERIFY_CLIENT_SECRET=your_client_secret

# Face Liveness
FACE_LIVENESS_BASE_URL=https://hackathon-face-liveness.e.gov.ph
FACE_LIVENESS_API_KEY=your_api_key
FACE_LIVENESS_CALLBACK_URL=https://your-app.com/callback/liveness

# DBM COMPASS
DBM_COMPASS_BASE_URL=https://api.compass.dbm.gov.ph
DBM_COMPASS_API_KEY=your_api_key

# eMessage
EMESSAGE_BASE_URL=https://api.emessage.egov.ph
EMESSAGE_API_TOKEN=your_api_token

# eReport
EREPORT_BASE_URL=https://api.ereport.egov.ph
EREPORT_ACCESS_CODE=your_access_code

# eGov AI
EGOVAI_BASE_URL=https://api.egovai.egov.ph
EGOVAI_ACCESS_CODE=your_access_code
```

### 1.3 Database Migration — Run Full Schema

Create all tables from PRD Section 10. The complete SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id VARCHAR(100) UNIQUE, -- Optional external identifier; local auth uses password_hash
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    suffix VARCHAR(20),
    mobile VARCHAR(20),
    gender VARCHAR(20),
    photo_url TEXT,
    role VARCHAR(30) CHECK (role IN ('TREASURER','CAPTAIN','CBO_AUDITOR','CITIZEN')) NOT NULL,
    barangay_psgc VARCHAR(10),
    municipality_psgc VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_barangay ON users(barangay_psgc);

-- PARENT LGUs
CREATE TABLE parent_lgus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    psgc_code VARCHAR(10) UNIQUE NOT NULL,
    region_code VARCHAR(10),
    province_code VARCHAR(10),
    macro_nta_ceiling DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    macro_lgsf_allocation DECIMAL(15,2) DEFAULT 0.00,
    compass_last_synced_at TIMESTAMPTZ,
    compass_raw_response JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- BARANGAY BUDGETS
CREATE TABLE barangay_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_lgu_id UUID REFERENCES parent_lgus(id) ON DELETE RESTRICT,
    barangay_name VARCHAR(100) NOT NULL,
    barangay_psgc VARCHAR(10) NOT NULL,
    fiscal_year INT NOT NULL,
    estimated_national_nta DECIMAL(15,2) DEFAULT 0.00,
    estimated_city_rpt_share DECIMAL(15,2) DEFAULT 0.00,
    estimated_local_fees DECIMAL(15,2) DEFAULT 0.00,
    total_approved_budget DECIMAL(15,2) GENERATED ALWAYS AS (
        estimated_national_nta + estimated_city_rpt_share + estimated_local_fees
    ) STORED,
    sk_allocation_ceiling DECIMAL(15,2) GENERATED ALWAYS AS (
        (estimated_national_nta + estimated_city_rpt_share + estimated_local_fees) * 0.10
    ) STORED,
    calamity_allocation_ceiling DECIMAL(15,2) GENERATED ALWAYS AS (
        (estimated_national_nta + estimated_city_rpt_share + estimated_local_fees) * 0.05
    ) STORED,
    budget_status VARCHAR(20) CHECK (
        budget_status IN ('DRAFT','SUBMITTED','OPERATIVE','ARCHIVED')
    ) DEFAULT 'DRAFT',
    submitted_by UUID REFERENCES users(id),
    submitted_at TIMESTAMPTZ,
    submission_liveness_session_id VARCHAR(100),
    submission_everify_token VARCHAR(100),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    egovchain_tx_hash VARCHAR(66),
    egovchain_archived_hash VARCHAR(66),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(barangay_psgc, fiscal_year)
);
CREATE INDEX idx_budgets_status ON barangay_budgets(budget_status);
CREATE INDEX idx_budgets_lgu ON barangay_budgets(parent_lgu_id);

-- PROJECT DISBURSEMENTS
CREATE TABLE project_disbursements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barangay_budget_id UUID REFERENCES barangay_budgets(id) ON DELETE RESTRICT,
    project_name VARCHAR(255) NOT NULL,
    project_description TEXT,
    fund_category VARCHAR(50) CHECK (
        fund_category IN ('SK_FUND','CALAMITY_FUND','GENERAL_FUND')
    ) NOT NULL,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    payee_supplier_name VARCHAR(255) NOT NULL,
    voucher_reference VARCHAR(100) NOT NULL,
    authorized_by UUID REFERENCES users(id) NOT NULL,
    authorized_by_philsys_id VARCHAR(100) NOT NULL,
    liveness_session_id VARCHAR(100) NOT NULL,
    liveness_confidence_score DECIMAL(5,2),
    voucher_file_url TEXT,
    ai_extracted_data JSONB,
    egovchain_block_hash VARCHAR(66),
    status VARCHAR(20) CHECK (status IN ('PENDING','APPROVED','REJECTED')) DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_disbursements_budget ON project_disbursements(barangay_budget_id);
CREATE INDEX idx_disbursements_fund ON project_disbursements(fund_category);

-- AUDIT LOGS
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    performed_by UUID REFERENCES users(id),
    api_name VARCHAR(50),
    api_endpoint VARCHAR(255),
    api_request_summary JSONB,
    api_response_summary JSONB,
    api_status_code INT,
    ip_address INET,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_action ON audit_logs(action);

-- NOTIFICATION LOGS
CREATE TABLE notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_user_id UUID REFERENCES users(id),
    recipient_mobile VARCHAR(20) NOT NULL,
    message_body TEXT NOT NULL,
    trigger_event VARCHAR(100) NOT NULL,
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    emessage_status_code INT,
    emessage_response JSONB,
    sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- COMPASS SYNC HISTORY
CREATE TABLE compass_sync_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_lgu_id UUID REFERENCES parent_lgus(id),
    sync_type VARCHAR(30) NOT NULL,
    report_year INT NOT NULL,
    records_fetched INT DEFAULT 0,
    previous_ceiling DECIMAL(15,2),
    new_ceiling DECIMAL(15,2),
    raw_response JSONB,
    status VARCHAR(20) CHECK (status IN ('SUCCESS','FAILED','PARTIAL')),
    error_message TEXT,
    synced_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

---

## Task 2: eGov API Integration Services

Build these as isolated service modules under `src/services/`:

### 2.1 Local Auth Service (`src/routes/auth.routes.ts`)

```typescript
// Responsibilities:
// 1. Register users with email/password credentials
// 2. Authenticate users with a salted password hash
// 3. Issue JWTs containing the internal RBAC role

interface EgovPhTokenResponse {
  access_token: string;
}

interface EgovPhProfile {
  uniqid: string;
  email: string;
  birth_date: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  suffix: string | null;
  gender: string;
  nationality: string;
  photo: string;
  mobile: string;
  address: string;
  street: string;
  barangay: string;
  municipality: string;
  province: string;
  region: string;
  zip_code: string;
}

// POST /api/auth/register
// Body: { email, password, first_name, last_name, role? }

// POST /api/auth/login
// Body: { email, password }
```

### 2.2 NationalID eVerify Service (`src/services/everify.service.ts`)

```typescript
// Responsibilities:
// 1. Authenticate (get server-to-server token)
// 2. Verify Personal Information (with face_liveness_session_id)
// 3. QR Check (decode QR without biometrics)
// 4. QR Verify (full biometric + QR match)

// POST /api/auth → { client_id, client_secret } → access_token
// POST /api/query → { first_name, middle_name, last_name, suffix, birth_date, face_liveness_session_id }
// POST /api/query/qr/check → { value: "RAW_QR_CODE_VALUE" }
// POST /api/query/qr → { value: "RAW_QR_CODE_VALUE", face_liveness_session_id }

// Token caching: Cache access_token in Redis until expires_at
```

### 2.3 Face Liveness Service (`src/services/liveness.service.ts`)

```typescript
// Responsibilities:
// 1. Create liveness session → returns token + URL
// 2. Poll verification result → returns status + confidence_score
// 3. Enforce threshold: confidence_score >= 95.0

// POST /v1/liveness/session
// Header: x-api-key: {{apiKey}}, Content-Type: application/json
// Body: { action: "redirect", callback_url: "...", delay: 3000 }
// Response: { token, url }

// GET /v1/liveness/result/{{sessionToken}}
// Header: x-api-key: {{apiKey}}
// Response: { status: "SUCCEEDED", confidence_score: 99.72, reference_image_url: "..." }

// BUSINESS RULE: Reject if status !== "SUCCEEDED" || confidence_score < 95.0
```

### 2.4 DBM COMPASS Service (`src/services/compass.service.ts`)

```typescript
// Responsibilities:
// 1. Fetch NCA records for macro ceiling calculation
// 2. Fetch SAAODB dashboard summary
// 3. Fetch LGSF records for municipal context
// 4. Store results in parent_lgus table + compass_sync_history

// GET /api/v1/records/nca?budgetYear=2026&deptCode=X&agencyCode=X&page=1&limit=100
// GET /api/v1/records/saaodb/dashboard?reportYear=2026&sheetScope=summary
// GET /api/v1/records/lgsf?fiscalYear=2026&province=X&cityMunicipality=X
// GET /api/v1/records/lgsf/dashboard?programCode=FALGU&reportYear=2026
// Header for all: X-API-Key: {{apiKey}}
```

### 2.5 eMessage Service (`src/services/emessage.service.ts`)

```typescript
// Responsibilities:
// 1. Send SMS notifications
// 2. Log all dispatch attempts in notification_logs table

// POST /messaging/v1/sms/push
// Headers: { "X-EMESSAGE-Auth": apiToken, "Content-Type": "application/json" }
// Body: { number: "+639XXXXXXXXX", message: "..." }
// Response: 201 Created

// Notification templates (from PRD):
// BUDGET_SUBMITTED → CBO: "[ePondo] Brgy. {name} submitted FY{year} budget. Ref: {id}"
// BUDGET_APPROVED → Treasurer: "[ePondo] Your FY{year} budget approved. Disbursements enabled."
// BUDGET_REJECTED → Treasurer: "[ePondo] Budget returned. Reason: {reason}"
// LARGE_DISBURSEMENT → Captain: "[ePondo] ₱{amount} to {payee} pending review. Ref: {voucher}"
```

### 2.6 eReport Service (`src/services/ereport.service.ts`)

```typescript
// Responsibilities:
// 1. Generate integration token
// 2. Fetch datasets (report types, regions, provinces, municipalities, barangays)
// 3. Submit complaint
// 4. OTP verify flow (request + confirm)
// 5. List/view reports

// POST /api/integration/token → { access_code } → integration_token
// GET /api/integration/datasets/report_types
// GET /api/integration/datasets/regions
// GET /api/integration/datasets/provinces?region_code=X
// GET /api/integration/datasets/municipalities?province_code=X
// GET /api/integration/datasets/barangays?municipality_code=X
// POST /api/integration/submit_complaint → full complaint payload
// POST /api/integration/verify/request → { email }
// POST /api/integration/verify/confirm → { email, otp } → report_view_token
// GET /api/integration/reports (Header: X-EReport-View-Token)
// GET /api/integration/reports/:case_number (Header: X-EReport-View-Token)
```

### 2.7 eGov AI Service (`src/services/egovai.service.ts`)

```typescript
// Responsibilities:
// 1. Generate hackathon token
// 2. Document Extractor (multipart file upload)
// 3. AI Assistant (natural language queries)
// 4. Laws & Regulations query
// 5. Translator
// 6. Monitor credits

// POST /api/v1/egov/integration/token → { access_code } → access_token + credits info
// POST /api/v1/egov/integration/document_extractor/generate (multipart/form-data: file)
// POST /api/v1/egov/integration/ai.assistant/generate → { prompt, category: "PH" }
// POST /api/v1/egov/integration/laws.and.regulations/generate → { prompt, category: "PH" }
// POST /api/v1/egov/integration/translator/generate → { prompt, source_lang, target_lang }
// GET /api/v1/egov/integration/credits
```

### 2.8 eGovchain Mock Service (`src/services/egovchain.service.ts`)

```typescript
// Mock implementation until real API is available
// Responsibilities:
// 1. Generate SHA-256 hash of state transition payload
// 2. Store hash with timestamp
// 3. Provide verification endpoint

import crypto from 'crypto';

function anchorState(payload: object): string {
  const hash = crypto.createHash('sha256')
    .update(JSON.stringify(payload) + Date.now())
    .digest('hex');
  return `0x${hash}`; // 66 chars (0x + 64 hex)
}
```

---

## Task 3: REST API Endpoints

### 3.1 Authentication Routes (`src/routes/auth.routes.ts`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/auth/login` | Local authentication information |
| POST | `/api/auth/register` | Create a local email/password account |
| POST | `/api/auth/login` | Authenticate a local account and issue JWT |
| GET | `/api/auth/me` | Get current user profile |
| POST | `/api/auth/logout` | Invalidate session |

### 3.2 Budget Routes (`src/routes/budget.routes.ts`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/budgets` | Create new budget (DRAFT) | TREASURER |
| GET | `/api/budgets` | List budgets (filtered by role scope) | ALL |
| GET | `/api/budgets/:id` | Get budget detail | ALL (scoped) |
| PUT | `/api/budgets/:id` | Update revenue inputs (DRAFT only) | TREASURER |
| POST | `/api/budgets/:id/submit` | Submit budget (DRAFT→SUBMITTED) | TREASURER |
| POST | `/api/budgets/:id/approve` | Approve budget (SUBMITTED→OPERATIVE) | CBO_AUDITOR |
| POST | `/api/budgets/:id/reject` | Reject budget (SUBMITTED→DRAFT) | CBO_AUDITOR |
| POST | `/api/budgets/:id/archive` | Archive budget (OPERATIVE→ARCHIVED) | CBO_AUDITOR |

**Submit endpoint logic:**
1. Validate budget is in DRAFT status
2. Validate all revenue fields > 0
3. Require `liveness_session_id` in body → verify via Face Liveness service (score ≥ 95.0)
4. Require demographics → verify via eVerify service
5. Update status to SUBMITTED
6. Send SMS to CBO via eMessage
7. Write audit log

**Approve endpoint logic:**
1. Validate budget is in SUBMITTED status
2. Fetch DBM COMPASS NCA ceiling for parent LGU
3. Validate budget total doesn't exceed proportional ceiling
4. Generate eGovchain hash
5. Update status to OPERATIVE
6. Send SMS to Treasurer via eMessage
7. Write audit log

### 3.3 Disbursement Routes (`src/routes/disbursement.routes.ts`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/budgets/:budgetId/disbursements` | Create disbursement | TREASURER |
| GET | `/api/budgets/:budgetId/disbursements` | List disbursements for budget | TREASURER, CBO |
| GET | `/api/disbursements/:id` | Get disbursement detail | TREASURER, CBO |
| POST | `/api/disbursements/:id/approve` | Captain co-approval (≥₱50k) | CAPTAIN |

**Create disbursement logic:**
1. Validate budget is OPERATIVE
2. Validate fund_category cap not exceeded:
   - SK_FUND: sum(existing) + new ≤ sk_allocation_ceiling
   - CALAMITY_FUND: sum(existing) + new ≤ calamity_allocation_ceiling
   - GENERAL_FUND: sum(existing) + new ≤ total_approved_budget - sk - calamity
3. Require liveness_session_id → verify (score ≥ 95.0)
4. Require authorized_by_philsys_id → verify via eVerify
5. Generate eGovchain block hash
6. If amount ≥ 50000, send SMS to Captain
7. Write audit log

### 3.4 COMPASS Routes (`src/routes/compass.routes.ts`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/compass/sync/:lguId` | Trigger COMPASS sync for an LGU | CBO_AUDITOR |
| GET | `/api/compass/nca/:lguId` | Get cached NCA data | CBO_AUDITOR |
| GET | `/api/compass/saaodb/dashboard` | Get SAAODB summary | CBO_AUDITOR |
| GET | `/api/compass/lgsf` | Get LGSF records | CBO_AUDITOR |

### 3.5 Identity Verification Routes (`src/routes/identity.routes.ts`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/identity/liveness/create` | Create Face Liveness session | ALL (authenticated) |
| GET | `/api/identity/liveness/result/:token` | Poll liveness result | ALL (authenticated) |
| POST | `/api/identity/verify` | Verify via eVerify (demographics + liveness) | ALL (authenticated) |
| POST | `/api/identity/qr/check` | QR code decode (no biometric) | ALL (authenticated) |
| POST | `/api/identity/qr/verify` | QR code + biometric verify | ALL (authenticated) |

### 3.6 Notification Routes (`src/routes/notification.routes.ts`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/notifications` | Get notification history for current user | ALL |
| GET | `/api/notifications/stats` | Notification delivery stats | CBO_AUDITOR |

### 3.7 AI Routes (`src/routes/ai.routes.ts`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/ai/extract-document` | Upload voucher for OCR extraction | TREASURER |
| POST | `/api/ai/assistant` | AI query about budget/eGov services | ALL |
| POST | `/api/ai/laws` | Query laws & regulations | ALL |
| POST | `/api/ai/translate` | Translate text | ALL |
| GET | `/api/ai/credits` | Check remaining AI credits | ALL |

### 3.8 Report/Complaint Routes (`src/routes/report.routes.ts`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/reports/datasets/report-types` | Get report type options | ALL |
| GET | `/api/reports/datasets/regions` | Get regions list | ALL |
| GET | `/api/reports/datasets/provinces` | Get provinces by region | ALL |
| GET | `/api/reports/datasets/municipalities` | Get municipalities by province | ALL |
| GET | `/api/reports/datasets/barangays` | Get barangays by municipality | ALL |
| POST | `/api/reports/submit` | Submit citizen complaint | CITIZEN |
| POST | `/api/reports/verify/request` | Request OTP for email | CITIZEN |
| POST | `/api/reports/verify/confirm` | Confirm OTP | CITIZEN |
| GET | `/api/reports` | List reports | CITIZEN (verified) |
| GET | `/api/reports/:caseNumber` | View report by case number | CITIZEN (verified) |

### 3.9 Audit Routes (`src/routes/audit.routes.ts`)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/audit/logs` | Paginated audit log | CBO_AUDITOR |
| GET | `/api/audit/logs/:entityType/:entityId` | Audit trail for specific entity | CBO_AUDITOR |
| GET | `/api/audit/blockchain/:hash` | Verify blockchain hash | ALL |

---

## Task 4: Middleware & Business Logic

### 4.1 Auth Middleware (`src/middleware/auth.middleware.ts`)

- Validate JWT from cookie or Authorization header
- Attach `req.user` with role, id, barangay_psgc, municipality_psgc
- Role-based route guards: `requireRole('TREASURER', 'CBO_AUDITOR')`

### 4.2 Budget State Machine (`src/logic/budget-state-machine.ts`)

```typescript
const VALID_TRANSITIONS = {
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['OPERATIVE', 'DRAFT'], // DRAFT = rejection
  OPERATIVE: ['ARCHIVED'],
  ARCHIVED: [],
};

function canTransition(current: string, target: string): boolean {
  return VALID_TRANSITIONS[current]?.includes(target) ?? false;
}
```

### 4.3 Fund Cap Enforcement (`src/logic/fund-cap.ts`)

```typescript
async function validateDisbursement(budgetId: string, category: string, amount: number) {
  const budget = await getBudget(budgetId);
  const totalSpent = await getTotalSpentByCategory(budgetId, category);
  
  const caps = {
    SK_FUND: budget.sk_allocation_ceiling,
    CALAMITY_FUND: budget.calamity_allocation_ceiling,
    GENERAL_FUND: budget.total_approved_budget - budget.sk_allocation_ceiling - budget.calamity_allocation_ceiling,
  };
  
  if (totalSpent + amount > caps[category]) {
    throw new Error(`Exceeds ${category} ceiling: ₱${caps[category]}. Already spent: ₱${totalSpent}`);
  }
}
```

### 4.4 Token Manager (`src/logic/token-manager.ts`)

- Cache eVerify access_token in Redis with TTL based on `expires_at`
- Cache eGov AI hackathon_token with TTL based on `expires_in_seconds`
- Auto-refresh tokens when nearing expiry
- eReport integration_token managed per-session

---

## Task 5: Background Jobs (BullMQ)

### 5.1 COMPASS Polling Job

```typescript
// Runs every 24h (or on-demand trigger from CBO)
// 1. For each parent_lgu in DB:
//    a. Fetch NCA records for their department/agency codes
//    b. Aggregate allotment totals
//    c. Update macro_nta_ceiling
//    d. Log to compass_sync_history
```

### 5.2 Notification Dispatch Job

```typescript
// Queue-based SMS dispatch:
// 1. Accept { recipientMobile, messageBody, triggerEvent, relatedEntity }
// 2. Call eMessage Push SMS
// 3. Log result to notification_logs
// 4. Retry up to 3 times on failure
```

---

## Task 6: API Response Contract (for Frontend Teams)

All responses follow this shape:

```typescript
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "error": { "code": "BUDGET_NOT_DRAFT", "message": "..." } }

// Paginated
{ "success": true, "data": [...], "pagination": { "page": 1, "limit": 25, "total": 100 } }
```

---

## Deliverables Checklist

- [ ] PostgreSQL schema migrated and running
- [ ] All 8 eGov service modules implemented
- [ ] Auth flow complete (email/password → JWT → RBAC)
- [ ] Budget CRUD + state machine + cap enforcement
- [ ] Disbursement CRUD + biometric gates
- [ ] Face Liveness create/result endpoints working
- [ ] eMessage SMS dispatch on state transitions
- [ ] COMPASS polling job + CBO data endpoints
- [ ] eReport proxy endpoints (datasets + complaint + OTP)
- [ ] eGov AI proxy endpoints (extractor + assistant + translator)
- [ ] eGovchain mock (SHA-256 hash generation)
- [ ] Audit logging on all state-changing operations
- [ ] API docs (at minimum, share Postman collection with Laptops 2 & 3)

---

## Coordination Notes for Laptops 2 & 3

- **Base URL:** `http://localhost:3000` (share via LAN IP or ngrok)
- **Auth:** Frontend gets JWT via `/api/auth/login` after local email/password authentication
- **All external API calls go through this backend** — frontend never calls eGov APIs directly
- **Postman Collection:** Export and share with team once endpoints are stable
