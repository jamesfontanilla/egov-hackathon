# 🇵🇭 Product Requirements Document (PRD)
## Local Governance Financial Compliance & Project Tracking System

> **Document Version:** 1.0  
> **Last Updated:** July 21, 2026  
> **Target Event:** eGovHackathon 2026 (DICT)  
> **Status:** Final Draft — Ready for Team Review  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement & Opportunity](#2-problem-statement--opportunity)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [Target Users & Personas](#4-target-users--personas)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [System Architecture](#7-system-architecture)
8. [eGov API Integration Specification](#8-egov-api-integration-specification)
9. [Budget Lifecycle State Machine](#9-budget-lifecycle-state-machine)
10. [Database Schema](#10-database-schema)
11. [User Interface & Experience](#11-user-interface--experience)
12. [Security & Compliance](#12-security--compliance)
13. [Risks & Mitigations](#13-risks--mitigations)
14. [Release Plan & Milestones](#14-release-plan--milestones)
15. [Open Questions & Action Items](#15-open-questions--action-items)

---

## 1. Executive Summary

This platform is a **multi-tenant, decentralized financial compliance and public project tracking system** designed for Local Government Units (LGUs) and their component Barangays in the Philippines. It bridges the visibility gap between national macro-funding allocations (monitored by DBM) and local project execution at the barangay level.

The system ensures that statutory budget allocations — such as the **10% SK Allocation (RA 10742)** and the **5% Calamity Fund (RA 10121)** — are strictly calculated via database-enforced generated columns, transparently managed through a 4-stage budget lifecycle, and opened to civic oversight through citizen reporting and AI-powered document analysis.

**Core Value Proposition:** Replace manual, error-prone budget compliance processes with an automated, blockchain-anchored, biometrically-secured platform that integrates exclusively with 7 verified eGov APIs to deliver end-to-end financial governance from national allocation to barangay disbursement.

---

## 2. Problem Statement & Opportunity

### 2.1 Problems Identified

| Problem | Impact | Current State |
|---------|--------|---------------|
| **Macro vs. Micro Gap** | National allocation systems (DBM COMPASS) monitor spending down to the LGU release level but lack visibility into local barangay disbursements and supplier vouchers | No programmatic bridge exists between DBM data and local execution |
| **Compliance Risk** | Local treasurers and youth councils (SK) face complex manual calculations to satisfy statutory percentage caps under RA 7160, RA 10742, RA 10121 | Manual spreadsheet calculations prone to human error |
| **Audit & Transparency Vacuum** | Grassroots projects lack immutable execution logs, making citizen feedback and audit tracking reactive | Paper-based audit trails easily lost or tampered with |
| **Identity Fraud in Approvals** | Budget approvals and large disbursements lack biometric verification, enabling unauthorized actions | Physical signature-based approvals with no anti-spoofing |
| **Citizen Disconnect** | Citizens have no structured way to flag ghost projects, delayed infrastructure, or substandard work | Verbal complaints with no tracking system |

### 2.2 Opportunity

The eGov API ecosystem provides all necessary building blocks (authentication, identity verification, biometrics, national budget data, blockchain, messaging, reporting, AI) to construct this system without external dependencies. The hackathon context allows us to demonstrate a working prototype that could scale to all 42,000+ barangays nationwide.

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals

1. **Automate statutory compliance calculations** — Eliminate manual computation of SK (10%) and Calamity Fund (5%) allocations through database-enforced generated columns.
2. **Establish immutable audit trails** — Anchor every budget state transition and disbursement approval on eGovchain (Hyperledger Besu).
3. **Bridge national-to-local budget visibility** — Programmatically poll DBM COMPASS data to set macro funding ceilings for parent LGUs.
4. **Enforce biometric security** — Require Face Liveness + NationalID eVerify for high-security actions (budget submission, large voucher approval).
5. **Enable civic oversight** — Allow citizens to file geotagged, OTP-verified complaints about local projects via eReport integration.
6. **Provide intelligent document analysis** — Use eGov AI to OCR-parse uploaded vouchers/POs and provide multilingual budget query assistance.

### 3.2 Success Metrics (KPIs)

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Budget compliance accuracy | 100% statutory cap enforcement | Zero over-allocation incidents in testing |
| Identity verification pass rate | ≥95% successful liveness checks | Face Liveness confidence_score ≥ 95.0 |
| Blockchain anchoring coverage | 100% of state transitions logged | Every OPERATIVE and ARCHIVED transition has eGovchain hash |
| Citizen report submission rate | ≥10 test reports during demo | eReport Submit Complaint endpoint success count |
| DBM data freshness | Updated within 24h of DBM publication | Automated COMPASS polling job |
| SMS notification delivery | 100% of state change events | eMessage Push SMS success responses (201) |
| Document parsing accuracy | ≥80% field extraction from vouchers | eGov AI Document Extractor validation |

---

## 4. Target Users & Personas

### 4.1 User Roles

| Role | Description | Access Level | Primary Actions |
|------|-------------|--------------|-----------------|
| **Barangay Treasurer** | Prepares and submits barangay budget profiles | Read/Write on own barangay budget | Create DRAFT budgets, input revenue estimates, submit for approval, create disbursement vouchers |
| **Barangay Captain** | Co-signs and oversees barangay financial operations | Read/Write on own barangay budget | Co-approve disbursements, view budget status, review compliance dashboards |
| **City Budget Officer (CBO)** | Reviews and approves submitted barangay budgets at the LGU level | Read on all barangays under LGU; Approve/Reject authority | Cross-reference DBM COMPASS ceilings, approve budgets to OPERATIVE, flag anomalies |
| **CBO Auditor** | Post-approval audit and compliance monitoring | Read-only on all barangays under LGU | View eGovchain audit trail, generate compliance reports, monitor spending velocity |
| **Citizen** | Public oversight and complaint filing | Read on public project data; Write for complaints | View active projects in their barangay, file geotagged eReport complaints, query budget info via AI Assistant |

### 4.2 Persona Details

**Persona 1: Maria Santos — Barangay Treasurer, Rural Barangay**
- 45 years old, non-technical, uses smartphone primarily
- Pain: Spends 2-3 days manually computing statutory caps every fiscal year
- Need: Automated compliance calculation, mobile-friendly interface, offline support
- Authentication touchpoints: local email/password login, NationalID eVerify for submission, Face Liveness for high-value vouchers

**Persona 2: Engr. Juan Reyes — City Budget Officer**
- 38 years old, manages 30+ barangay budgets under City of Alaminos
- Pain: No single dashboard to compare all barangay compliance ratios against DBM allocations
- Need: Aggregated analytics, automated DBM ceiling validation, alerts for non-compliant submissions
- Authentication touchpoints: local email/password login, DBM COMPASS cross-referencing, eMessage alerts

**Persona 3: Ana Villanueva — Concerned Citizen**
- 28 years old, notices a barangay road project appears abandoned
- Pain: No formal channel to report the issue with evidence and tracking
- Need: Geotagged complaint filing, OTP verification, status tracking by case number
- eGov touchpoints: eReport complaint submission, eGov AI for budget queries in Filipino

---

## 5. Functional Requirements

### 5.1 Authentication & Identity Module

| ID | Requirement | Priority | API Dependency |
|----|-------------|----------|----------------|
| FR-AUTH-01 | Users authenticate with local email/password credentials | P0 | Internal — `POST /api/auth/login` |
| FR-AUTH-02 | Upon login, system returns the local user profile (name, email, mobile, role) | P0 | Internal — `GET /api/auth/me` |
| FR-AUTH-03 | System maps local user accounts to internal RBAC roles (TREASURER, CAPTAIN, CBO_AUDITOR, CITIZEN) | P0 | Internal |
| FR-AUTH-04 | High-security actions require NationalID eVerify identity validation | P0 | NationalID eVerify — `POST /api/query` |
| FR-AUTH-05 | Face Liveness check required before budget submission (DRAFT→SUBMITTED) | P0 | Face Liveness — `POST /v1/liveness/session` + `GET /v1/liveness/result/{token}` |
| FR-AUTH-06 | Face Liveness check required before large disbursement approval (≥₱50,000) | P1 | Face Liveness |
| FR-AUTH-07 | System rejects liveness sessions with confidence_score < 95.0 | P0 | Face Liveness |
| FR-AUTH-08 | NationalID QR code scanning supported as alternative identity verification | P1 | NationalID eVerify — `POST /api/query/qr/check` and `POST /api/query/qr` |

### 5.2 Budget Management Module

| ID | Requirement | Priority | API Dependency |
|----|-------------|----------|----------------|
| FR-BUD-01 | Barangay Treasurer can create a new budget profile for a fiscal year | P0 | Internal |
| FR-BUD-02 | Revenue inputs: estimated_national_nta, estimated_city_rpt_share, estimated_local_fees | P0 | Internal |
| FR-BUD-03 | System auto-calculates total_approved_budget as sum of all revenue inputs | P0 | Internal (DB generated column) |
| FR-BUD-04 | System auto-calculates sk_allocation_ceiling as 10% of total budget (RA 10742) | P0 | Internal (DB generated column) |
| FR-BUD-05 | System auto-calculates calamity_allocation_ceiling as 5% of total budget (RA 10121) | P0 | Internal (DB generated column) |
| FR-BUD-06 | Budget status follows 4-stage state machine: DRAFT → SUBMITTED → OPERATIVE → ARCHIVED | P0 | Internal |
| FR-BUD-07 | Spending/disbursement modules remain locked until budget reaches OPERATIVE status | P0 | Internal |
| FR-BUD-08 | CBO can cross-reference macro NTA ceiling from DBM COMPASS before approving | P0 | DBM COMPASS — `GET /api/v1/records/nca` |
| FR-BUD-09 | CBO can view LGSF allocations for the municipality | P1 | DBM COMPASS — `GET /api/v1/records/lgsf` |
| FR-BUD-10 | Budget approval writes state hash to eGovchain | P0 | eGovchain (TBD) |
| FR-BUD-11 | Year-end archival permanently seals budget on eGovchain | P0 | eGovchain (TBD) |
| FR-BUD-12 | Each barangay can only have one active budget per fiscal year | P0 | Internal (DB UNIQUE constraint) |

### 5.3 Disbursement & Voucher Module

| ID | Requirement | Priority | API Dependency |
|----|-------------|----------|----------------|
| FR-DIS-01 | Treasurer can create project disbursement records under OPERATIVE budgets | P0 | Internal |
| FR-DIS-02 | Each disbursement must specify fund_category: SK_FUND, CALAMITY_FUND, or GENERAL_FUND | P0 | Internal |
| FR-DIS-03 | System enforces that total SK_FUND disbursements ≤ sk_allocation_ceiling | P0 | Internal |
| FR-DIS-04 | System enforces that total CALAMITY_FUND disbursements ≤ calamity_allocation_ceiling | P0 | Internal |
| FR-DIS-05 | Each disbursement requires NationalID eVerify token of the authorizing official | P0 | NationalID eVerify |
| FR-DIS-06 | Each disbursement requires Face Liveness session_id of the authorizing official | P0 | Face Liveness |
| FR-DIS-07 | Disbursement approval anchors block hash on eGovchain | P1 | eGovchain (TBD) |
| FR-DIS-08 | Uploaded voucher/PO documents are parsed via eGov AI Document Extractor | P1 | eGov AI — `POST /api/v1/egov/integration/document_extractor/generate` |
| FR-DIS-09 | AI-extracted data is pre-filled into disbursement form for user validation | P2 | eGov AI |
| FR-DIS-10 | System tracks payee_supplier_name and voucher_reference for audit purposes | P0 | Internal |

### 5.4 Notification & Alerts Module

| ID | Requirement | Priority | API Dependency |
|----|-------------|----------|----------------|
| FR-NOT-01 | SMS alert sent to CBO when a barangay submits budget (DRAFT→SUBMITTED) | P0 | eMessage — `POST /messaging/v1/sms/push` |
| FR-NOT-02 | SMS alert sent to Treasurer when CBO approves budget (SUBMITTED→OPERATIVE) | P0 | eMessage |
| FR-NOT-03 | SMS alert sent to Treasurer when CBO rejects budget (SUBMITTED→DRAFT with feedback) | P1 | eMessage |
| FR-NOT-04 | SMS alert sent to Citizen when a project in their barangay starts (first disbursement) | P2 | eMessage |
| FR-NOT-05 | SMS alert sent to Captain when a large voucher (≥₱50,000) is created | P1 | eMessage |
| FR-NOT-06 | Recipient mobile numbers sourced from the local user profile | P0 | Local user `mobile` field |

### 5.5 Citizen Oversight & Reporting Module

| ID | Requirement | Priority | API Dependency |
|----|-------------|----------|----------------|
| FR-CIT-01 | Citizens can view active projects and disbursements in their barangay (public read) | P0 | Internal |
| FR-CIT-02 | Citizens can submit geotagged complaints about local projects | P0 | eReport — `POST /api/integration/submit_complaint` |
| FR-CIT-03 | Complaint submission requires OTP email verification | P0 | eReport — `POST /api/integration/verify/request` + `POST /api/integration/verify/confirm` |
| FR-CIT-04 | Citizens can track complaint status by case number | P1 | eReport — `GET /api/integration/reports/:case_number` |
| FR-CIT-05 | Location selection uses cascading dropdowns from eReport datasets (Region→Province→Municipality→Barangay) | P0 | eReport datasets |
| FR-CIT-06 | Citizens can ask budget questions in natural language (Filipino/English) | P2 | eGov AI — `POST /api/v1/egov/integration/ai.assistant/generate` |
| FR-CIT-07 | AI responses scoped to Philippine jurisdiction using category="PH" | P2 | eGov AI |
| FR-CIT-08 | Citizens can query applicable laws/regulations about budget compliance | P2 | eGov AI — `POST /api/v1/egov/integration/laws.and.regulations/generate` |

### 5.6 Macro Budget Intelligence Module

| ID | Requirement | Priority | API Dependency |
|----|-------------|----------|----------------|
| FR-MAC-01 | System polls DBM COMPASS for NCA records to determine macro NTA ceiling | P0 | DBM COMPASS — `GET /api/v1/records/nca` |
| FR-MAC-02 | Macro ceiling stored in parent_lgus.macro_nta_ceiling and refreshed periodically | P0 | Internal + DBM COMPASS |
| FR-MAC-03 | CBO dashboard displays SAAODB summary (appropriations, allotments, obligations, disbursements) | P1 | DBM COMPASS — `GET /api/v1/records/saaodb/dashboard` |
| FR-MAC-04 | System can retrieve SARO records to validate claimed allotment releases | P2 | DBM COMPASS — `GET /api/v1/records/saro` |
| FR-MAC-05 | LGSF data (Financial Assistance to LGUs) displayed for context | P1 | DBM COMPASS — `GET /api/v1/records/lgsf` |
| FR-MAC-06 | LGSF dashboard KPIs shown: totalReleased, projectsCount, lguCount | P2 | DBM COMPASS — `GET /api/v1/records/lgsf/dashboard` |
| FR-MAC-07 | Hierarchical entity navigation (Department→Agency→Fund Source) for auditing | P2 | DBM COMPASS — `GET /api/v1/records/saaodb/entities` |

### 5.7 AI & Document Intelligence Module

| ID | Requirement | Priority | API Dependency |
|----|-------------|----------|----------------|
| FR-AI-01 | Upload disbursement voucher/PO image for OCR extraction | P1 | eGov AI — Document Extractor |
| FR-AI-02 | Supported formats: JPEG, PNG, PDF | P1 | eGov AI |
| FR-AI-03 | Extracted fields: document type, payee name, amount, date, reference number | P1 | eGov AI |
| FR-AI-04 | Multilingual AI assistant for public budget queries (Filipino, English, Ilocano, Cebuano) | P2 | eGov AI — AI Assistant |
| FR-AI-05 | Translation service for making budget reports accessible in local languages | P2 | eGov AI — Translator |
| FR-AI-06 | Laws & Regulations AI for compliance guidance (RA 7160, RA 10742, RA 10121) | P2 | eGov AI — Laws & Regulations |
| FR-AI-07 | Monitor remaining API credits to avoid hitting limits during demo | P1 | eGov AI — `GET /api/v1/egov/integration/credits` |

---

## 6. Non-Functional Requirements

### 6.1 Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-PERF-01 | API response time for internal operations | < 500ms (p95) |
| NFR-PERF-02 | Face Liveness session creation + redirect | < 2 seconds |
| NFR-PERF-03 | DBM COMPASS data polling (background job) | Complete within 60 seconds per LGU |
| NFR-PERF-04 | Page load time for CBO dashboard | < 3 seconds |
| NFR-PERF-05 | Concurrent users supported | ≥50 simultaneous users |

### 6.2 Availability & Reliability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-AVL-01 | System uptime (excluding eGov API downtime) | 99.5% |
| NFR-AVL-02 | Graceful degradation when eGov APIs are unavailable | Show cached data, queue retries |
| NFR-AVL-03 | Offline-first mobile capability for provincial barangays | IndexedDB/SQLite local cache, sync on reconnect |

### 6.3 Security

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-SEC-01 | All API credentials (partner_secret, client_secret, api_keys) stored in secure vault | Never exposed to client-side |
| NFR-SEC-02 | All eGov API calls made server-to-server (never from browser directly) | Backend proxy for all external calls |
| NFR-SEC-03 | Session tokens expire and refresh per eGov API specifications | Respect `expires_at` / `expires_in_seconds` |
| NFR-SEC-04 | Face Liveness confidence threshold strictly enforced | ≥ 95.0 or reject |
| NFR-SEC-05 | HTTPS enforced for all communications | TLS 1.2+ |
| NFR-SEC-06 | Database encryption at rest | PostgreSQL with encrypted volumes |
| NFR-SEC-07 | Audit log for all state transitions and API calls | Internal logging table |

### 6.4 Scalability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-SCL-01 | Multi-tenant architecture supporting multiple LGUs | Each parent_lgu is an isolated tenant |
| NFR-SCL-02 | Horizontal scaling for API layer | Stateless backend behind load balancer |
| NFR-SCL-03 | Database supports 42,000+ barangay records | Proper indexing, partitioning by fiscal_year |

### 6.5 Accessibility & Localization

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-A11Y-01 | WCAG 2.1 AA compliance for web interface | Keyboard navigation, screen reader support |
| NFR-A11Y-02 | Mobile-responsive design (primary user device is smartphone) | Works on 360px+ screens |
| NFR-A11Y-03 | Multilingual UI: Filipino (default), English | eGov AI Translator for dynamic content |
| NFR-A11Y-04 | SMS notifications in Filipino | Plain-text SMS via eMessage |

---

## 7. System Architecture

### 7.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                    │
│                                                                         │
│  ┌─────────────────┐  ┌──────────────────┐  ┌───────────────────────┐  │
│  │  Web App (SPA)  │  │  Mobile PWA      │  │  CBO Dashboard        │  │
│  │  - Treasurer    │  │  - Offline-first  │  │  - Analytics          │  │
│  │  - Captain      │  │  - Camera/QR      │  │  - COMPASS integration│  │
│  │  - Citizen      │  │  - Liveness SDK   │  │  - Multi-barangay     │  │
│  └────────┬────────┘  └────────┬─────────┘  └──────────┬────────────┘  │
│           │                    │                        │                │
└───────────┼────────────────────┼────────────────────────┼────────────────┘
            │                    │                        │
            └────────────────────┼────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │     API GATEWAY /       │
                    │     BACKEND (REST)      │
                    │                         │
                    │  - Auth middleware       │
                    │  - RBAC enforcement      │
                    │  - Rate limiting         │
                    │  - Request validation    │
                    └────────────┬────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
┌─────────▼──────────┐ ┌────────▼────────┐ ┌──────────▼──────────┐
│  SERVICE LAYER     │ │  DATA LAYER     │ │  EXTERNAL APIs      │
│                    │ │                  │ │                      │
│  - Budget Service  │ │  - PostgreSQL    │ │  - eGovPH SSO       │
│  - Disbursement Svc│ │  - Redis Cache   │ │  - NationalID eVerify│
│  - Identity Service│ │  - Job Queue     │ │  - Face Liveness     │
│  - Notification Svc│ │                  │ │  - DBM COMPASS       │
│  - Reporting Svc   │ │                  │ │  - eMessage          │
│  - AI Service      │ │                  │ │  - eReport           │
│  - COMPASS Polling │ │                  │ │  - eGov AI           │
│                    │ │                  │ │  - eGovchain         │
└────────────────────┘ └──────────────────┘ └──────────────────────┘
```

### 7.2 Technology Stack (Recommended)

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Nuxt 3 (Vue.js) / Next.js (React) | SSR for SEO on public pages, SPA for dashboard |
| Mobile | PWA with Service Workers | Offline-first for provincial connectivity |
| Backend | Node.js (Express/Fastify) or Python (FastAPI) | Async-friendly for multiple external API calls |
| Database | PostgreSQL 15+ | Generated columns, UUID support, JSONB for flexible audit logs |
| Cache | Redis | Token caching, rate limiting, session management |
| Job Queue | BullMQ (Node) / Celery (Python) | Background COMPASS polling, notification dispatch |
| Deployment | Docker + Cloud (AWS/GCP) or On-prem | Containerized microservices |

### 7.3 Data Flow Diagram

```
[Treasurer Login]
    │
    ▼
[eGovPH SSO] ──── exchange_code ────► [Backend: /api/token] ──── access_token ────► [Backend: /api/partner/sso_authentication]
    │                                                                                          │
    │                                                                                          ▼
    │                                                                              [User Profile → RBAC Mapping]
    │                                                                                          │
    ▼                                                                                          ▼
[Treasurer creates DRAFT budget] ──► [eGov AI: Document Extractor validates attachments]
    │
    ▼
[Treasurer submits budget]
    │
    ├──► [Face Liveness: Create Session → User selfie → Get Result (≥95.0)]
    ├──► [NationalID eVerify: Verify Personal Information with face_liveness_session_id]
    │
    ▼
[Budget status: SUBMITTED] ──► [eMessage: SMS to CBO "Budget pending review"]
    │
    ▼
[CBO reviews] ──► [DBM COMPASS: Cross-reference NCA/LGSF ceiling]
    │
    ▼
[CBO approves] ──► [eGovchain: Anchor state hash] ──► [eMessage: SMS to Treasurer "Approved"]
    │
    ▼
[Budget status: OPERATIVE — disbursements unlocked]
    │
    ▼
[Disbursement created] ──► [Face Liveness + eVerify for authorization]
                           ──► [eGovchain: Block hash anchor]
                           ──► [eMessage: SMS to Captain if ≥₱50k]
```

---

## 8. eGov API Integration Specification

### 8.1 Local Authentication

**Purpose:** Local email/password authentication for all user roles with JWT-based sessions.

| Endpoint | Method | URL | Auth |
|----------|--------|-----|------|
| Register | POST | `/api/auth/register` | None |
| Login | POST | `/api/auth/login` | None |
| Current User | GET | `/api/auth/me` | `Bearer {{jwt}}` |

**Login Request:**
```json
// Request: POST /api/auth/login
{
  "email": "citizen@example.com",
  "password": "local-password"
}

// Response: 200 OK
{
  "token": "eyJ...<JWT>..."
}
```

**Local Profile:**
Returns: `id`, `email`, `firstName`, `middleName`, `lastName`, `mobile`, `gender`, `role`, `barangayPsgc`, `municipalityPsgc`

**Integration Notes:**
- Passwords are stored as salted `scrypt` hashes and never returned to clients
- Use the returned JWT in the `Authorization` header for protected API calls
- Official roles are assigned locally; development registration supports role selection for the demo

---

### 8.2 NationalID eVerify (Identity Validation)

**Purpose:** Validate citizen identity against PhilSys (National ID) database with biometric matching.

| Endpoint | Method | URL | Auth |
|----------|--------|-----|------|
| Authenticate | POST | `{{base_url}}/api/auth` | None (uses client credentials) |
| Verify Personal Information | POST | `{{base_url}}/api/query` | `Bearer {{access_token}}` |
| QR Check | POST | `{{base_url}}/api/query/qr/check` | `Bearer {{access_token}}` |
| QR Verify | POST | `{{base_url}}/api/query/qr` | `Bearer {{access_token}}` |

**Authentication:**
```json
// Request: POST /api/auth
{
  "client_id": "{{client_id}}",
  "client_secret": "{{client_secret}}"
}

// Response: 200 OK
{
  "data": {
    "access_token": "eyJ0eXAi...",
    "token_type": "Bearer",
    "expires_at": "1724293772"
  }
}
```

**Verify Personal Information:**
```json
// Request: POST /api/query
{
  "first_name": "Juan",
  "middle_name": "Santos",
  "last_name": "Dela Cruz",
  "suffix": "Jr",
  "birth_date": "1989-01-01",
  "face_liveness_session_id": "a1b3fae6-af74-4896-b058-32a51004a081"
}
```

**Integration Notes:**
- The `face_liveness_session_id` is obtained from the Face Liveness API (Create Session)
- The eVerify Face Liveness Web SDK must be integrated on frontend: `eVerify.start(config, pubKey)` → returns `result.session_id`
- QR Check decodes without biometric matching (quick lookup)
- QR Verify performs full biometric match (high security)
- Returns full profile including: full_name, gender, marital_status, blood_type, email, mobile_number, birth_date, full_address

---

### 8.3 Face Liveness (Biometric Anti-Spoofing)

**Purpose:** Confirm a live person is present during identity capture to prevent spoofing attacks.

| Endpoint | Method | URL | Auth |
|----------|--------|-----|------|
| Create Session | POST | `{{baseUrl}}/v1/liveness/session` | `x-api-key: {{apiKey}}` |
| Get Verification Result | GET | `{{baseUrl}}/v1/liveness/result/{{sessionToken}}` | `x-api-key: {{apiKey}}` |

**Create Session:**
```json
// Request: POST /v1/liveness/session
{
  "action": "redirect",
  "callback_url": "https://your-app.com/callback",
  "delay": 3000
}

// Response: 201 Created
{
  "token": "00000000-0000-0000-0000-000000000000",
  "url": "https://hackathon-face-liveness.e.gov.ph/liveness?token=...&action=redirect&callbackUrl=...&delay=3000"
}
```

**Get Verification Result:**
```json
// Response: 200 OK
{
  "status": "SUCCEEDED",
  "confidence_score": 99.72,
  "reference_image_url": "https://...s3.../reference.jpg?..."
}
```

**Security Thresholds:**
- Status must be exactly `"SUCCEEDED"`
- Confidence score must be ≥ **95.0** (out of 100.0)
- If score < 95.0 → reject session as high-risk, prompt retry

**Integration Flow:**
1. Backend calls Create Session → receives `token` + `url`
2. Frontend opens `url` in webview/iframe for selfie capture
3. User completes liveness check on eGov hosted page
4. User redirected back to `callback_url`
5. Backend polls Get Verification Result with `token`
6. If SUCCEEDED + score ≥ 95.0 → use `token` as `face_liveness_session_id` for eVerify

---

### 8.4 DBM COMPASS (Macro Budget Baseline)

**Purpose:** Programmatically access national DBM budget execution data to set macro funding ceilings for parent LGUs.

| Endpoint | Method | URL | Auth |
|----------|--------|-----|------|
| Get SAAODB Records | GET | `{{baseUrl}}/api/v1/records/saaodb` | `X-API-Key: {{apiKey}}` |
| Get SAAODB Dashboard Summary | GET | `{{baseUrl}}/api/v1/records/saaodb/dashboard` | `X-API-Key: {{apiKey}}` |
| Get SAAODB Hierarchical Entities | GET | `{{baseUrl}}/api/v1/records/saaodb/entities` | `X-API-Key: {{apiKey}}` |
| Get NCA Records | GET | `{{baseUrl}}/api/v1/records/nca` | `X-API-Key: {{apiKey}}` |
| Get SARO Records | GET | `{{baseUrl}}/api/v1/records/saro` | `X-API-Key: {{apiKey}}` |
| Get LGSF Records | GET | `{{baseUrl}}/api/v1/records/lgsf` | `X-API-Key: {{apiKey}}` |
| Get LGSF Dashboard Summary | GET | `{{baseUrl}}/api/v1/records/lgsf/dashboard` | `X-API-Key: {{apiKey}}` |

**Primary Use — NCA Polling for Macro Ceiling:**
```
GET /api/v1/records/nca?budgetYear=2026&deptCode=010000000000&agencyCode=010010000000&page=1&limit=100
Header: X-API-Key: {{apiKey}}
```

**LGSF for Municipal Context:**
```
GET /api/v1/records/lgsf?fiscalYear=2026&programCode=FALGU&province=Pangasinan&cityMunicipality=Alaminos&page=1&limit=100
Header: X-API-Key: {{apiKey}}
```

**Background Polling Strategy:**
- Scheduled job runs every 24 hours (or on-demand trigger by CBO)
- Fetches NCA records for the parent LGU's department/agency codes
- Updates `parent_lgus.macro_nta_ceiling` with aggregated allotment totals
- Stores raw COMPASS response in audit log for traceability

**SAAODB Response Fields Used:**
- `appropriations` — Total appropriations amount
- `allotments` — Released allotments
- `obligations` — Obligations incurred
- `disbursements` — Actual disbursements
- `unobligatedAllotments` — Unobligated balance
- `fundSource` — Source classification (Special Purpose Funds)

---

### 8.5 eMessage (Automated Alerts)

**Purpose:** Deliver SMS notifications to officials and citizens through a single messaging endpoint.

| Endpoint | Method | URL | Auth |
|----------|--------|-----|------|
| Push SMS | POST | `{{base_url}}/messaging/v1/sms/push` | `X-EMESSAGE-Auth: {{api_token}}` |

**Request:**
```json
// Headers
{
  "X-EMESSAGE-Auth": "{{api_token}}",
  "Content-Type": "application/json"
}

// Body
{
  "number": "+639090000000",
  "message": "Test message"
}
```

**Response:** `201 Created` — `{ "data": { "message": "SMS was successfully created." } }`

**Error Codes:** 400 Bad Request, 422 Unprocessable Entity

**Notification Templates:**

| Trigger Event | Recipient | Message Template |
|---------------|-----------|-----------------|
| Budget submitted (DRAFT→SUBMITTED) | CBO | `"[BudgetTrack] Brgy. {name} has submitted FY{year} budget for review. Ref: {id}"` |
| Budget approved (SUBMITTED→OPERATIVE) | Treasurer | `"[BudgetTrack] Your FY{year} budget has been approved. Disbursements are now enabled."` |
| Budget rejected | Treasurer | `"[BudgetTrack] Your FY{year} budget was returned for revision. Reason: {reason}"` |
| Large disbursement created (≥₱50k) | Captain | `"[BudgetTrack] Disbursement of ₱{amount} to {payee} pending your review. Ref: {voucher}"` |
| Project started (first disbursement) | Citizen | `"[BudgetTrack] Project '{name}' has started in your barangay. Track progress at {url}"` |
| Citizen complaint received | Complainant | `"[BudgetTrack] Your report #{case_number} has been received. Track status at {url}"` |

**Integration Notes:**
- Uses custom header `X-EMESSAGE-Auth` (not Bearer token)
- Mobile numbers must be in E.164 format: `+63XXXXXXXXXX`
- Separate credential configuration from other APIs
- Fire-and-forget pattern — no delivery confirmation callback

---

### 8.6 eReport (Civic Oversight)

**Purpose:** Enable citizens to file and track complaints about local government projects with OTP verification and geographic tagging.

| Endpoint | Method | URL | Auth |
|----------|--------|-----|------|
| Generate Token | POST | `/api/integration/token` | None (uses access_code) |
| Report Type List | GET | `/api/integration/datasets/report_types` | `Bearer {{integration_token}}` |
| Region List | GET | `/api/integration/datasets/regions` | `Bearer {{integration_token}}` |
| Province List | GET | `/api/integration/datasets/provinces?region_code=X` | `Bearer {{integration_token}}` |
| Municipality List | GET | `/api/integration/datasets/municipalities?province_code=X` | `Bearer {{integration_token}}` |
| Barangay List | GET | `/api/integration/datasets/barangays?municipality_code=X` | `Bearer {{integration_token}}` |
| Submit Complaint | POST | `/api/integration/submit_complaint` | `Bearer {{integration_token}}` |
| Verify – Request OTP | POST | `/api/integration/verify/request` | `Bearer {{integration_token}}` |
| Verify – Confirm OTP | POST | `/api/integration/verify/confirm` | `Bearer {{integration_token}}` |
| Reports List | GET | `/api/integration/reports` | `X-EReport-View-Token` |
| View Report by Case Number | GET | `/api/integration/reports/:case_number` | `X-EReport-View-Token` |

**Submit Complaint Request:**
```json
{
  "mobile": "+639000000000",
  "first_name": "Juan",
  "middle_name": "Santos",
  "last_name": "Dela Cruz",
  "gender": "Male",
  "complainant_email": "juan.delacruz@email.com",
  "report_type": "Infrastructure",
  "excerpt": "Road project stalled",
  "message": "The road construction in our area has not progressed for 3 months...",
  "evidences": ["https://storage.example.com/photo1.jpg"],
  "psgc_code": "042111000",
  "province_name": "Pangasinan",
  "municipality_code": "042111000",
  "municipality_name": "Alaminos",
  "barangay_code": "042111001",
  "barangay_name": "Poblacion",
  "category": "Full address",
  "longitude": "120.50",
  "latitude": "16.15"
}
```

**Two-Phase Authentication Pattern:**
1. `integration_token` — for write operations (submit complaint)
2. OTP flow → produces `report_view_token` — for read operations (list/view reports)

**Integration Notes:**
- Cascading geographic datasets can be reused for budget module's barangay selection UI
- OTP sent to complainant's email, not SMS
- Evidence URLs must be pre-uploaded to accessible storage
- Case numbers follow format: `PFM MMDDYY XXXX`

---

### 8.7 eGov AI (Intelligent Assistance)

**Purpose:** Document intelligence, translation, and conversational endpoints for government workloads.

| Endpoint | Method | URL | Auth |
|----------|--------|-----|------|
| Generate Access Token | POST | `/api/v1/egov/integration/token` | None (uses access_code) |
| AI Assistant | POST | `/api/v1/egov/integration/ai.assistant/generate` | `Bearer {{hackathon_token}}` |
| Speech Maker | POST | `/api/v1/egov/integration/speech_maker/generate` | `Bearer {{hackathon_token}}` |
| Tourism | POST | `/api/v1/egov/integration/tourism/generate` | `Bearer {{hackathon_token}}` |
| Laws & Regulations | POST | `/api/v1/egov/integration/laws.and.regulations/generate` | `Bearer {{hackathon_token}}` |
| Translator | POST | `/api/v1/egov/integration/translator/generate` | `Bearer {{hackathon_token}}` |
| Document Extractor | POST | `/api/v1/egov/integration/document_extractor/generate` | `Bearer {{hackathon_token}}` |
| Token Credits | GET | `/api/v1/egov/integration/credits` | `Bearer {{hackathon_token}}` |

**Document Extractor (Primary Use):**
```
POST /api/v1/egov/integration/document_extractor/generate
Content-Type: multipart/form-data
Authorization: Bearer {{hackathon_token}}

Form field: file (JPEG, PNG, or PDF)
```

**AI Assistant (Citizen Budget Queries):**
```json
// Request
{
  "prompt": "How can I check if my barangay's SK fund allocation is compliant?",
  "category": "PH"
}
```

**Laws & Regulations (Compliance Guidance):**
```json
// Request
{
  "prompt": "What is the mandatory percentage for Sangguniang Kabataan allocation under RA 10742?",
  "category": "PH"
}
```

**Translator (Multilingual Support):**
```json
// Request
{
  "prompt": "Your budget has been approved and disbursements are now enabled.",
  "source_lang": "en",
  "target_lang": "fil"
}
```

**Credit Management:**
- Total credits: 200 per team
- Monitor via `GET /credits` endpoint
- Prioritize Document Extractor and AI Assistant usage
- Speech Maker and Tourism endpoints not primary to our use case

---

### 8.8 eGovchain (Immutable Audit Trail)

**Purpose:** Anchor budget approval hashes, voucher execution logs, and year-end state transitions onto the zero-fee Hyperledger Besu government blockchain network.

**Status:** API documentation pending from eGov platform. Integration will be implemented once endpoints are published.

**Planned Usage:**
- Write state hash when budget transitions to OPERATIVE
- Write block hash when disbursement is approved
- Write permanent vault lock when budget is ARCHIVED at fiscal year-end
- All hashes stored in `barangay_budgets.egovchain_tx_hash` and `project_disbursements.egovchain_block_hash`

**Fallback Strategy:**
If eGovchain API is unavailable during hackathon, implement a mock blockchain service that:
- Generates SHA-256 hashes of state transition payloads
- Stores hashes locally with timestamps
- Can be swapped for real eGovchain calls when API becomes available

---

### 8.9 API Credential Summary

| API | Auth Mechanism | Credential Storage Key |
|-----|---------------|----------------------|
| NationalID eVerify | Client ID + secret → Bearer token | `EVERIFY_CLIENT_ID`, `EVERIFY_CLIENT_SECRET` |
| Face Liveness | x-api-key header | `FACE_LIVENESS_API_KEY` |
| DBM COMPASS | X-API-Key header | `DBM_COMPASS_API_KEY` |
| eMessage | X-EMESSAGE-Auth header | `EMESSAGE_API_TOKEN` |
| eReport | Access code → Bearer token | `EREPORT_ACCESS_CODE` |
| eGov AI | Access code → Bearer token (credit-based) | `EGOVAI_ACCESS_CODE` |
| eGovchain | TBD | `EGOVCHAIN_*` |

---

## 9. Budget Lifecycle State Machine

### 9.1 State Diagram

```
                    ┌─────────────────────────────────────────────────────────────────┐
                    │                                                                 │
                    │  ┌──────────┐    ┌───────────┐    ┌───────────┐    ┌──────────┐│
                    │  │  DRAFT   │───►│ SUBMITTED │───►│ OPERATIVE │───►│ ARCHIVED ││
                    │  └──────────┘    └───────────┘    └───────────┘    └──────────┘│
                    │       ▲               │                                        │
                    │       │               │                                        │
                    │       └───────────────┘                                        │
                    │         (CBO Rejects)                                           │
                    │                                                                 │
                    └─────────────────────────────────────────────────────────────────┘
```

### 9.2 State Transition Rules

| Transition | Trigger | Pre-conditions | Side Effects |
|------------|---------|----------------|--------------|
| → DRAFT | Treasurer creates budget | User has TREASURER role; no existing budget for that barangay+fiscal_year | Budget record created with default values |
| DRAFT → SUBMITTED | Treasurer clicks "Submit" | All revenue fields > 0; Face Liveness SUCCEEDED (≥95.0); NationalID eVerify passed | Inputs locked; eMessage SMS to CBO; eGov AI validates attachments |
| SUBMITTED → DRAFT | CBO rejects | CBO provides rejection reason | Inputs unlocked; eMessage SMS to Treasurer with reason |
| SUBMITTED → OPERATIVE | CBO approves | DBM COMPASS ceiling verified; CBO has CBO_AUDITOR role | Disbursement modules unlocked; eGovchain state hash written; eMessage SMS to Treasurer; statutory caps active |
| OPERATIVE → ARCHIVED | Fiscal year-end trigger (or manual CBO action) | All disbursements settled; fiscal year closed | Remaining balances frozen; eGovchain permanent vault lock; no further modifications allowed |

### 9.3 State Properties

| State | Revenue Inputs | Disbursements | Modifications Allowed | Blockchain |
|-------|---------------|---------------|----------------------|------------|
| DRAFT | Editable | Locked | Full edit | None |
| SUBMITTED | Frozen | Locked | None (awaiting CBO) | None |
| OPERATIVE | Frozen | Unlocked | Disbursements only | State hash on entry |
| ARCHIVED | Frozen | Frozen | None (immutable) | Vault lock on entry |

### 9.4 Statutory Cap Enforcement (Active in OPERATIVE)

When budget is OPERATIVE, the following constraints are enforced on every disbursement creation:

```sql
-- Before allowing a new SK_FUND disbursement:
SELECT COALESCE(SUM(amount), 0) as total_sk_spent
FROM project_disbursements
WHERE barangay_budget_id = :budget_id AND fund_category = 'SK_FUND';

-- Enforce: total_sk_spent + new_amount ≤ barangay_budgets.sk_allocation_ceiling

-- Before allowing a new CALAMITY_FUND disbursement:
SELECT COALESCE(SUM(amount), 0) as total_calamity_spent
FROM project_disbursements
WHERE barangay_budget_id = :budget_id AND fund_category = 'CALAMITY_FUND';

-- Enforce: total_calamity_spent + new_amount ≤ barangay_budgets.calamity_allocation_ceiling
```

---

## 10. Database Schema

### 10.1 Entity Relationship Diagram

```
┌──────────────────┐       ┌────────────────────────┐       ┌──────────────────────────┐
│   parent_lgus    │       │   barangay_budgets     │       │  project_disbursements   │
├──────────────────┤       ├────────────────────────┤       ├──────────────────────────┤
│ id (PK, UUID)    │◄──┐   │ id (PK, UUID)          │◄──┐   │ id (PK, UUID)            │
│ name             │   └──│ parent_lgu_id (FK)     │   └──│ barangay_budget_id (FK)  │
│ psgc_code (UQ)   │       │ barangay_name          │       │ project_name             │
│ macro_nta_ceiling│       │ fiscal_year            │       │ fund_category            │
│ updated_at       │       │ estimated_national_nta │       │ amount                   │
└──────────────────┘       │ estimated_city_rpt_share│       │ payee_supplier_name      │
                           │ estimated_local_fees   │       │ voucher_reference        │
┌──────────────────┐       │ total_approved_budget * │       │ authorized_by_philsys_id │
│    users         │       │ sk_allocation_ceiling * │       │ liveness_session_id      │
├──────────────────┤       │ calamity_alloc_ceiling *│       │ egovchain_block_hash     │
│ id (PK, UUID)    │       │ budget_status          │       │ created_at               │
│ egovph_imguid    │       │ egovchain_tx_hash      │       └──────────────────────────┘
│ email            │       │ UQ(barangay, fiscal_yr)│
│ first_name       │       └────────────────────────┘
│ last_name        │                                         * = GENERATED ALWAYS AS (computed) STORED
│ mobile           │       ┌────────────────────────┐
│ role             │       │    audit_logs          │
│ barangay_psgc    │       ├────────────────────────┤
│ municipality_psgc│       │ id (PK, UUID)          │
│ created_at       │       │ action                 │
└──────────────────┘       │ entity_type            │
                           │ entity_id              │
                           │ performed_by (FK users)│
                           │ metadata (JSONB)       │
                           │ api_response (JSONB)   │
                           │ created_at             │
                           └────────────────────────┘
```

### 10.2 Full Schema Definition (PostgreSQL)

```sql
-- ============================================================
-- USERS TABLE (populated from local registration)
-- ============================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id VARCHAR(100) UNIQUE,              -- Optional external identifier
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    suffix VARCHAR(20),
    mobile VARCHAR(20),                          -- E.164 format for eMessage
    gender VARCHAR(20),
    photo_url TEXT,
    role VARCHAR(30) CHECK (
        role IN ('TREASURER', 'CAPTAIN', 'CBO_AUDITOR', 'CITIZEN')
    ) NOT NULL,
    barangay_psgc VARCHAR(10),                   -- PSGC code of assigned barangay
    municipality_psgc VARCHAR(10),               -- PSGC code of assigned municipality
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_barangay ON users(barangay_psgc);
CREATE INDEX idx_users_municipality ON users(municipality_psgc);

-- ============================================================
-- PARENT LGUs (City / Municipality Authority Profile)
-- ============================================================
CREATE TABLE parent_lgus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    psgc_code VARCHAR(10) UNIQUE NOT NULL,
    region_code VARCHAR(10),
    province_code VARCHAR(10),
    macro_nta_ceiling DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    macro_lgsf_allocation DECIMAL(15, 2) DEFAULT 0.00,
    compass_last_synced_at TIMESTAMP WITH TIME ZONE,
    compass_raw_response JSONB,                  -- Raw DBM COMPASS data for audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- BARANGAY BUDGETS (Component Budget Profiles)
-- ============================================================
CREATE TABLE barangay_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_lgu_id UUID REFERENCES parent_lgus(id) ON DELETE RESTRICT,
    barangay_name VARCHAR(100) NOT NULL,
    barangay_psgc VARCHAR(10) NOT NULL,
    fiscal_year INT NOT NULL,
    
    -- Ingested Income Components
    estimated_national_nta DECIMAL(15, 2) DEFAULT 0.00,
    estimated_city_rpt_share DECIMAL(15, 2) DEFAULT 0.00,
    estimated_local_fees DECIMAL(15, 2) DEFAULT 0.00,
    
    -- Stored Generated Columns (Hardcoded Statutory Caps)
    total_approved_budget DECIMAL(15, 2) GENERATED ALWAYS AS (
        estimated_national_nta + estimated_city_rpt_share + estimated_local_fees
    ) STORED,
    
    sk_allocation_ceiling DECIMAL(15, 2) GENERATED ALWAYS AS (
        (estimated_national_nta + estimated_city_rpt_share + estimated_local_fees) * 0.10
    ) STORED,  -- RA 10742 Mandatory 10% SK Allocation
    
    calamity_allocation_ceiling DECIMAL(15, 2) GENERATED ALWAYS AS (
        (estimated_national_nta + estimated_city_rpt_share + estimated_local_fees) * 0.05
    ) STORED,  -- RA 10121 Mandatory 5% Calamity Fund
    
    -- State Machine Controls
    budget_status VARCHAR(20) CHECK (
        budget_status IN ('DRAFT', 'SUBMITTED', 'OPERATIVE', 'ARCHIVED')
    ) DEFAULT 'DRAFT',
    
    -- Submission Verification Records
    submitted_by UUID REFERENCES users(id),
    submitted_at TIMESTAMP WITH TIME ZONE,
    submission_liveness_session_id VARCHAR(100),
    submission_everify_token VARCHAR(100),
    
    -- Approval Records
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    -- Blockchain Audit
    egovchain_tx_hash VARCHAR(66),
    egovchain_archived_hash VARCHAR(66),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(barangay_psgc, fiscal_year)
);

CREATE INDEX idx_budgets_status ON barangay_budgets(budget_status);
CREATE INDEX idx_budgets_lgu ON barangay_budgets(parent_lgu_id);
CREATE INDEX idx_budgets_fiscal_year ON barangay_budgets(fiscal_year);

-- ============================================================
-- PROJECT DISBURSEMENTS (Line Item Vouchers)
-- ============================================================
CREATE TABLE project_disbursements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barangay_budget_id UUID REFERENCES barangay_budgets(id) ON DELETE RESTRICT,
    project_name VARCHAR(255) NOT NULL,
    project_description TEXT,
    fund_category VARCHAR(50) CHECK (
        fund_category IN ('SK_FUND', 'CALAMITY_FUND', 'GENERAL_FUND')
    ) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    payee_supplier_name VARCHAR(255) NOT NULL,
    voucher_reference VARCHAR(100) NOT NULL,
    
    -- API Security Verification Keys
    authorized_by UUID REFERENCES users(id) NOT NULL,
    authorized_by_philsys_id VARCHAR(100) NOT NULL,
    liveness_session_id VARCHAR(100) NOT NULL,
    liveness_confidence_score DECIMAL(5, 2),
    
    -- Document Intelligence
    voucher_file_url TEXT,
    ai_extracted_data JSONB,                     -- eGov AI Document Extractor result
    
    -- Blockchain Audit
    egovchain_block_hash VARCHAR(66),
    
    -- Status
    status VARCHAR(20) CHECK (
        status IN ('PENDING', 'APPROVED', 'REJECTED')
    ) DEFAULT 'PENDING',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_disbursements_budget ON project_disbursements(barangay_budget_id);
CREATE INDEX idx_disbursements_fund ON project_disbursements(fund_category);
CREATE INDEX idx_disbursements_status ON project_disbursements(status);

-- ============================================================
-- AUDIT LOGS (All state transitions and API interactions)
-- ============================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(100) NOT NULL,                -- e.g., 'BUDGET_SUBMITTED', 'DISBURSEMENT_CREATED'
    entity_type VARCHAR(50) NOT NULL,            -- e.g., 'barangay_budget', 'project_disbursement'
    entity_id UUID NOT NULL,
    performed_by UUID REFERENCES users(id),
    
    -- API Call Audit
    api_name VARCHAR(50),                        -- e.g., 'FACE_LIVENESS', 'EVERIFY', 'EGOVCHAIN'
    api_endpoint VARCHAR(255),
    api_request_summary JSONB,                   -- Sanitized request (no secrets)
    api_response_summary JSONB,                  -- Key response fields
    api_status_code INT,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,                              -- Flexible additional context
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_user ON audit_logs(performed_by);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- ============================================================
-- NOTIFICATION LOG (eMessage dispatch tracking)
-- ============================================================
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
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- COMPASS SYNC HISTORY (DBM data polling log)
-- ============================================================
CREATE TABLE compass_sync_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_lgu_id UUID REFERENCES parent_lgus(id),
    sync_type VARCHAR(30) NOT NULL,              -- 'NCA', 'SAAODB', 'LGSF', 'SARO'
    report_year INT NOT NULL,
    records_fetched INT DEFAULT 0,
    previous_ceiling DECIMAL(15, 2),
    new_ceiling DECIMAL(15, 2),
    raw_response JSONB,
    status VARCHAR(20) CHECK (status IN ('SUCCESS', 'FAILED', 'PARTIAL')),
    error_message TEXT,
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 11. User Interface & Experience

### 11.1 Screen Inventory

| Screen | Role(s) | Description |
|--------|---------|-------------|
| Login / Registration | All | Local email/password login with JWT session |
| Dashboard — Treasurer | TREASURER | Budget status card, quick actions, compliance meters |
| Dashboard — CBO | CBO_AUDITOR | Multi-barangay overview, pending reviews, COMPASS data |
| Dashboard — Citizen | CITIZEN | Barangay project list, file complaint button, AI chat |
| Budget Creation Form | TREASURER | Revenue input form with real-time statutory cap preview |
| Budget Submission Flow | TREASURER | Face Liveness webview → eVerify confirmation → Submit |
| Budget Review — CBO | CBO_AUDITOR | Side-by-side: barangay budget vs. COMPASS ceiling |
| Disbursement Form | TREASURER | Project details, fund category, voucher upload, amount |
| Disbursement Auth Flow | TREASURER/CAPTAIN | Face Liveness → eVerify → Confirm disbursement |
| Citizen Complaint Form | CITIZEN | Map pin, photo upload, description, OTP verification |
| Complaint Tracker | CITIZEN | Case number lookup, status timeline |
| AI Budget Assistant | CITIZEN | Chat interface for budget queries in Filipino/English |
| Audit Trail Viewer | CBO_AUDITOR | Blockchain hash timeline, API call log |
| COMPASS Data Explorer | CBO_AUDITOR | NCA/SAAODB/LGSF data tables with filtering |
| Notification Center | All | SMS history and alert log |

### 11.2 Key UX Flows

**Flow 1: Budget Submission (Treasurer)**
```
[Budget Form Complete] → [Click "Submit for Review"]
        │
        ▼
[Modal: "Identity verification required"]
        │
        ▼
[Face Liveness webview opens] → [User captures selfie]
        │
        ▼
[Liveness check passes (≥95.0)] → [eVerify validation]
        │
        ▼
[Success: "Budget submitted!" + SMS sent to CBO]
```

**Flow 2: Citizen Complaint (Citizen)**
```
[Click "Report a Problem"] → [Select barangay from cascading dropdowns]
        │
        ▼
[Pin location on map] → [Upload photo evidence] → [Describe issue]
        │
        ▼
[Enter email for verification] → [OTP sent] → [Enter 6-digit OTP]
        │
        ▼
[Complaint submitted] → [Receive case number] → [Track via "My Reports"]
```

**Flow 3: CBO Budget Approval**
```
[Notification: "New budget pending review"] → [Open review screen]
        │
        ▼
[View: Barangay budget details + statutory caps calculated]
        │
        ▼
[View: DBM COMPASS NCA ceiling for parent LGU]
        │
        ▼
[Compare: Barangay total vs. macro ceiling proportion]
        │
        ▼
[Approve] → [eGovchain hash written] → [SMS to Treasurer] → [Status: OPERATIVE]
   or
[Reject + Reason] → [SMS to Treasurer with reason] → [Status: DRAFT]
```

### 11.3 Design Principles

1. **Mobile-first** — Primary users (Treasurers, Citizens) access via smartphones
2. **Offline-capable** — Service Workers + IndexedDB for provincial connectivity gaps
3. **Progressive disclosure** — Complex compliance data revealed on demand, not upfront
4. **Trust indicators** — Blockchain hash badges, verification checkmarks, timestamp trails
5. **Accessibility** — Large touch targets, high contrast, screen reader labels
6. **Filipino-first** — Default UI language is Filipino with English toggle

---

## 12. Security & Compliance

### 12.1 Statutory Compliance

| Statute | Requirement | System Implementation |
|---------|-------------|----------------------|
| RA 7160 (Local Government Code) | 4-stage budget lifecycle for barangay budgets | State machine: DRAFT → SUBMITTED → OPERATIVE → ARCHIVED |
| RA 10742 (SK Reform Act) | 10% of annual barangay budget allocated to SK programs | `sk_allocation_ceiling` generated column = total * 0.10 |
| RA 10121 (Disaster Risk Reduction Act) | 5% of annual revenue for disaster preparedness | `calamity_allocation_ceiling` generated column = total * 0.05 |
| Data Privacy Act (RA 10173) | Protection of personal information | Encrypted storage, role-based access, audit logging |
| COA Rules & Regulations | Audit trail for all financial transactions | eGovchain anchoring, comprehensive audit_logs table |

### 12.2 Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     SECURITY LAYERS                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Layer 1: AUTHENTICATION (eGovPH SSO)                            │
│  ├─ OAuth2 code exchange                                         │
│  ├─ JWT token validation                                         │
│  └─ Session management with secure cookies                       │
│                                                                   │
│  Layer 2: IDENTITY VERIFICATION (NationalID eVerify)             │
│  ├─ PhilSys database matching                                    │
│  ├─ QR code verification                                         │
│  └─ Demographics + biometric cross-check                         │
│                                                                   │
│  Layer 3: BIOMETRIC ANTI-SPOOFING (Face Liveness)                │
│  ├─ Active liveness detection                                    │
│  ├─ Confidence threshold ≥ 95.0                                  │
│  └─ Session-bound verification (one-time use)                    │
│                                                                   │
│  Layer 4: AUTHORIZATION (RBAC)                                   │
│  ├─ Role-based endpoint access                                   │
│  ├─ Barangay-scoped data isolation                               │
│  └─ Principle of least privilege                                 │
│                                                                   │
│  Layer 5: IMMUTABLE AUDIT (eGovchain)                            │
│  ├─ Hyperledger Besu state anchoring                             │
│  ├─ Tamper-evident transaction hashes                            │
│  └─ COA-ready compliance trail                                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 12.3 Data Protection Measures

| Measure | Implementation |
|---------|---------------|
| Secrets management | Environment variables / vault service; never in source code |
| API key rotation | Credential rotation schedule; expiry monitoring for eGov AI tokens |
| Input validation | Server-side validation on all endpoints; parameterized queries |
| Rate limiting | Per-user and per-IP rate limits on API gateway |
| CORS policy | Strict origin allowlist for frontend domains only |
| XSS prevention | Content Security Policy headers; input sanitization |
| CSRF protection | Token-based CSRF for state-changing operations |
| Audit immutability | Audit logs append-only; no UPDATE/DELETE permissions on audit tables |

### 12.4 RBAC Permission Matrix

| Resource / Action | TREASURER | CAPTAIN | CBO_AUDITOR | CITIZEN |
|-------------------|-----------|---------|-------------|---------|
| Create budget (own barangay) | ✅ | ❌ | ❌ | ❌ |
| Edit DRAFT budget | ✅ | ❌ | ❌ | ❌ |
| Submit budget | ✅ | ❌ | ❌ | ❌ |
| Approve/Reject budget | ❌ | ❌ | ✅ | ❌ |
| Create disbursement | ✅ | ❌ | ❌ | ❌ |
| Co-approve disbursement (≥₱50k) | ❌ | ✅ | ❌ | ❌ |
| View own barangay budget | ✅ | ✅ | ✅ | ✅ (public data only) |
| View all barangay budgets in LGU | ❌ | ❌ | ✅ | ❌ |
| View COMPASS data | ❌ | ❌ | ✅ | ❌ |
| View audit trail | ❌ | ❌ | ✅ | ❌ |
| Submit eReport complaint | ❌ | ❌ | ❌ | ✅ |
| Use AI Assistant | ✅ | ✅ | ✅ | ✅ |
| View public project list | ✅ | ✅ | ✅ | ✅ |

---

## 13. Risks & Mitigations

### 13.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| eGov API downtime during demo | Medium | High | Implement circuit breakers; cache last-known-good data; mock fallback for Face Liveness |
| eGov AI credit exhaustion (200 limit) | Medium | Medium | Monitor credits via `/credits` endpoint; prioritize Document Extractor calls; cache AI responses |
| Face Liveness SDK compatibility issues (mobile browsers) | Low | High | Test on top 3 PH mobile browsers (Chrome Android, Safari iOS, Samsung Internet); fallback to QR Verify flow |
| eGovchain API unavailable / undocumented | High | Medium | Implement mock blockchain (SHA-256 hash store); architecture ready to swap in real API |
| Network connectivity in provincial areas | High | Medium | Offline-first architecture with Service Workers; queue-and-sync pattern |
| DBM COMPASS data not available for target LGU | Medium | Medium | Allow CBO to manually input macro ceiling; mark as "pending COMPASS verification" |

### 13.2 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Scope creep during hackathon | High | High | Strict P0/P1/P2 prioritization; P0 features only for MVP demo |
| User adoption resistance (non-technical treasurers) | Medium | High | Mobile-first UX; Filipino default language; minimal steps for core actions |
| Regulatory changes to statutory percentages | Low | Low | Generated columns are parameterizable; single-point-of-change in schema |
| Multi-tenant data isolation breach | Low | Critical | Row-level security policies; tenant-scoped queries; penetration testing |

### 13.3 Dependency Risks

| Dependency | Risk | Contingency |
|-----------|------|-------------|
| PostgreSQL availability | Cannot authenticate users | Start PostgreSQL and run the migration before login |
| NationalID eVerify API | Cannot verify identity for submissions | Queue submission; allow CBO to manually verify with uploaded ID |
| Face Liveness hosted page | Cannot complete biometric check | Allow QR code verification as fallback (NationalID QR Verify) |
| eMessage delivery | SMS may not arrive | Log all notifications; provide in-app notification center as backup |
| DBM COMPASS data freshness | Data may be stale | Show `last_synced_at` timestamp; allow manual refresh |

---

## 14. Release Plan & Milestones

### 14.1 Hackathon MVP Scope (P0 Features Only)

**Target: Fully working demo with end-to-end flow**

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| **Phase 1: Foundation** | Day 1 (8h) | Project scaffolding, DB schema migration, local authentication, user RBAC |
| **Phase 2: Budget Core** | Day 1-2 (12h) | Budget CRUD, state machine, statutory cap calculations, COMPASS polling |
| **Phase 3: Security Layer** | Day 2 (8h) | Face Liveness integration, NationalID eVerify flow, biometric gates |
| **Phase 4: Notifications** | Day 2-3 (4h) | eMessage SMS integration for all state transitions |
| **Phase 5: Disbursements** | Day 3 (8h) | Disbursement creation, fund cap enforcement, auth flow |
| **Phase 6: Citizen Module** | Day 3 (6h) | eReport complaint submission, OTP flow, report tracking |
| **Phase 7: AI & Polish** | Day 3-4 (6h) | eGov AI Document Extractor, AI Assistant chatbot, UI polish |
| **Phase 8: Demo Prep** | Day 4 (4h) | End-to-end testing, demo script, fallback scenarios |

### 14.2 Feature Priority Matrix

| Priority | Features | Must Have for Demo? |
|----------|----------|-------------------|
| **P0 (Critical)** | Local Login, Budget CRUD, State Machine, Face Liveness, eVerify, eMessage notifications, Statutory Caps, COMPASS ceiling, eGovchain mock | ✅ Yes |
| **P1 (Important)** | Disbursement module, eReport complaint flow, Document Extractor, CBO dashboard with COMPASS data, QR code verification | ✅ For wow factor |
| **P2 (Nice-to-have)** | AI Assistant chatbot, Translator, Laws & Regulations query, LGSF dashboard, offline sync, notification center | ❌ If time permits |

### 14.3 Post-Hackathon Roadmap

| Phase | Timeline | Features |
|-------|----------|----------|
| v1.1 | +2 weeks | Full offline sync protocol, push notifications, email notifications |
| v1.2 | +1 month | eGovchain real integration (when API published), advanced CBO analytics |
| v2.0 | +3 months | Multi-LGU deployment, Commission on Audit (COA) report generation, SK council sub-module |
| v3.0 | +6 months | National rollout preparation, performance optimization for 42k+ barangays, accessibility audit |

---

## 15. Open Questions & Action Items

### 15.1 Technical Decisions Pending

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | **Offline Sync Protocol:** What IndexedDB/SQLite schema should the mobile client use for provincial barangays with intermittent connectivity? | Frontend Lead | 🟡 Open |
| 2 | **eGovchain API:** When will the eGovchain endpoint documentation be available? Should we proceed with the mock implementation? | Team Lead | 🟡 Open |
| 3 | **eGov AI Document Parsing:** What minimum resolution and file formats (.PDF, .JPG, .PNG) should be enforced for voucher uploads? What's the max file size? | Backend Lead | 🟡 Open |
| 4 | **RBAC Role Assignment:** How are official roles assigned? Manual admin assignment or local development registration? | Product Owner | 🟡 Open |
| 5 | **Face Liveness Action Type:** Should we use `redirect`, `post`, or `close` for the liveness session action? Depends on SPA vs. mobile webview architecture. | Frontend Lead | 🟡 Open |
| 6 | **DBM COMPASS Mapping:** How do we map a parent LGU's PSGC code to the correct `deptCode`/`agencyCode` in the NCA endpoint? | Backend Lead | 🟡 Open |
| 7 | **eReport Report Types:** Which report types from the eReport dataset map to our use cases (ghost project, delayed, substandard)? | Product Owner | 🟡 Open |
| 8 | **Multi-signature for Large Disbursements:** Should Captain co-approval be a separate Face Liveness session or just an in-app confirmation? | Product Owner | 🟡 Open |
| 9 | **Token Refresh Strategy:** eGov AI tokens expire in ~25,000 seconds. eVerify tokens expire at a Unix timestamp. How do we unify token lifecycle management? | Backend Lead | 🟡 Open |
| 10 | **Demo Environment:** What base URLs will be used for each API during the hackathon? Are there rate limits? | Team Lead | 🟡 Open |

### 15.2 Action Items

- [ ] **Offline Sync:** Define mobile client IndexedDB/SQLite schema for low-connectivity provincial barangays
- [ ] **eGov AI Formats:** Agree on minimum resolution and file formats for voucher scanning
- [ ] **CBO Dashboard:** Finalize key metrics (LGU-wide compliance ratios, flagged velocity spikes)
- [ ] **RBAC Mapping:** Document internal permissions matrix linking local accounts to role types
- [ ] **eGovchain Mock:** Build SHA-256 hash mock service as fallback
- [ ] **COMPASS Integration:** Map PSGC codes to UACS department/agency codes for NCA queries
- [ ] **Environment Setup:** Collect all API base URLs, keys, and access codes from eGov portal
- [ ] **Test Accounts:** Generate eGov test exchange codes for each team member
- [ ] **Demo Script:** Write end-to-end demo scenario covering all 7 API integrations
- [ ] **Load Testing:** Verify system handles 50 concurrent users with acceptable response times

---

## Appendix A: Glossary

| Term | Definition |
|------|-----------|
| **LGU** | Local Government Unit (City or Municipality) |
| **Barangay** | Smallest administrative division in the Philippines |
| **SK** | Sangguniang Kabataan (Youth Council) |
| **CBO** | City Budget Officer |
| **NTA** | Notice of Transfer of Allocation (national funds to LGUs) |
| **LGSF** | Local Government Support Fund |
| **SAAODB** | Statement of Appropriations, Allotments, Obligations, and Disbursements |
| **NCA** | Notice of Cash Allocation |
| **SARO** | Special Allotment Release Order |
| **PSGC** | Philippine Standard Geographic Code |
| **UACS** | Unified Account Code Structure |
| **COA** | Commission on Audit |
| **DBM** | Department of Budget and Management |
| **DICT** | Department of Information and Communications Technology |
| **PhilSys** | Philippine Identification System (National ID) |
| **RPT** | Real Property Tax |
| **RA** | Republic Act |
| **MOOE** | Maintenance and Other Operating Expenses |
| **FINEX** | Financial Expenses |
| **CO** | Capital Outlay |
| **PS** | Personal Services |
| **E.164** | International telephone number format (+country code + number) |
| **RBAC** | Role-Based Access Control |
| **PWA** | Progressive Web Application |
| **OTP** | One-Time Password |

---

## Appendix B: API Authentication Quick Reference

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ API                │ Auth Method              │ Token Lifetime       │ Refresh?      │
├────────────────────┼──────────────────────────┼──────────────────────┼───────────────┤
│ eGovPH             │ Bearer (from exchange)   │ Short-lived          │ New exchange  │
│ NationalID eVerify │ Bearer (from client cred)│ Unix timestamp expiry│ Re-auth       │
│ Face Liveness      │ x-api-key (static)       │ N/A (key-based)      │ N/A           │
│ DBM COMPASS        │ X-API-Key (static)       │ N/A (key-based)      │ N/A           │
│ eMessage           │ X-EMESSAGE-Auth (static) │ N/A (token-based)    │ N/A           │
│ eReport            │ Bearer (from access_code)│ Session-based        │ Re-generate   │
│ eGov AI            │ Bearer (from access_code)│ ~25,000 seconds      │ Re-generate   │
│ eGovchain          │ TBD                      │ TBD                  │ TBD           │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Appendix C: Legal References

| Statute | Key Provision Relevant to This System |
|---------|--------------------------------------|
| **RA 7160** (Local Government Code of 1991) | Establishes the budget preparation and approval process for barangays; defines the 4-stage lifecycle |
| **RA 10742** (SK Reform Act of 2015) | Mandates 10% of the annual barangay budget be allocated to SK programs and projects |
| **RA 10121** (Disaster Risk Reduction and Management Act of 2010) | Requires 5% of estimated revenue be set aside for disaster preparedness/response |
| **RA 10173** (Data Privacy Act of 2012) | Governs processing and protection of personal information |
| **RA 11055** (Philippine Identification System Act of 2018) | Establishes PhilSys/PhilID as the national identification system |

---

*End of Document*
