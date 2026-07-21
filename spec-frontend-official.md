# 🏛️ SPEC 2: Official Dashboard Frontend (Developer B — Frontend)
## ePondo — Treasurer, Captain & CBO Interface

> **Owner:** Developer B (Frontend — Officials)  
> **Stack:** Nuxt 3 (Vue.js) + TailwindCSS + Pinia  
> **Runs on:** Laptop 2  
> **Depends on:** Laptop 1 (Backend API at `http://<laptop1-ip>:3000`)  
> **Coordination:** Consumes REST API from Backend; no direct eGov API calls

---

## Scope

This spec covers:
- Login/SSO redirect flow
- Treasurer Dashboard (budget management, disbursements, document upload)
- Captain Dashboard (disbursement co-approval)
- CBO Dashboard (multi-barangay review, COMPASS data, audit trail)
- Face Liveness webview integration
- Notification center

This spec does NOT cover:
- Backend/API logic (Spec 1)
- Citizen-facing module (Spec 3)

---

## Task 1: Project Scaffolding

### 1.1 Initialize Nuxt 3 Project

```bash
npx nuxi@latest init epondo-official
cd epondo-official
npm install @pinia/nuxt @nuxtjs/tailwindcss
npm install @vueuse/core axios
npx tailwindcss init
```

### 1.2 Project Structure

```
epondo-official/
├── layouts/
│   ├── default.vue          # Main app layout with sidebar
│   └── auth.vue             # Login/callback layout (no sidebar)
├── pages/
│   ├── index.vue            # Redirect to login or dashboard
│   ├── login.vue            # eGovPH SSO redirect
│   ├── callback.vue         # SSO callback handler
│   ├── dashboard/
│   │   ├── index.vue        # Role-based dashboard router
│   │   ├── treasurer.vue    # Treasurer home
│   │   └── cbo.vue          # CBO home
│   ├── budgets/
│   │   ├── index.vue        # Budget list
│   │   ├── [id].vue         # Budget detail
│   │   ├── create.vue       # New budget form
│   │   └── submit.vue       # Submission flow (liveness + verify)
│   ├── disbursements/
│   │   ├── index.vue        # Disbursement list
│   │   ├── create.vue       # New disbursement form
│   │   └── [id].vue         # Disbursement detail
│   ├── compass/
│   │   ├── index.vue        # COMPASS data explorer (CBO only)
│   │   └── sync.vue         # Trigger sync
│   ├── audit/
│   │   └── index.vue        # Audit trail viewer (CBO only)
│   └── notifications/
│       └── index.vue        # Notification history
├── components/
│   ├── budget/
│   │   ├── BudgetForm.vue
│   │   ├── BudgetCard.vue
│   │   ├── StatutoryCapMeter.vue
│   │   └── StatusBadge.vue
│   ├── disbursement/
│   │   ├── DisbursementForm.vue
│   │   ├── FundCapProgress.vue
│   │   └── VoucherUpload.vue
│   ├── identity/
│   │   ├── LivenessModal.vue
│   │   └── VerifyFlow.vue
│   ├── compass/
│   │   ├── NcaTable.vue
│   │   ├── SaaodobSummary.vue
│   │   └── LgsfDashboard.vue
│   ├── common/
│   │   ├── AppSidebar.vue
│   │   ├── AppHeader.vue
│   │   ├── DataTable.vue
│   │   ├── ConfirmModal.vue
│   │   └── LoadingSpinner.vue
│   └── audit/
│       ├── AuditTimeline.vue
│       └── BlockchainBadge.vue
├── composables/
│   ├── useAuth.ts
│   ├── useApi.ts
│   ├── useBudget.ts
│   ├── useDisbursement.ts
│   ├── useLiveness.ts
│   └── useNotifications.ts
├── stores/
│   ├── auth.store.ts
│   ├── budget.store.ts
│   └── notification.store.ts
└── middleware/
    ├── auth.global.ts       # Redirect to login if no JWT
    └── role.ts              # Role-based page guards
```

### 1.3 API Client Configuration

```typescript
// composables/useApi.ts
const API_BASE = process.env.NUXT_PUBLIC_API_URL || 'http://localhost:3000';

export function useApi() {
  const authStore = useAuthStore();
  
  const client = axios.create({
    baseURL: API_BASE,
    headers: { Authorization: `Bearer ${authStore.token}` }
  });
  
  return { client };
}
```

---

## Task 2: Authentication Flow

### 2.1 Login Page (`pages/login.vue`)

- Display ePondo logo + "Login with eGov" button
- On click: redirect to backend `/api/auth/login` which redirects to eGovPH SSO
- After SSO, user is redirected to `/callback?code=EXCHANGE_CODE`

### 2.2 Callback Handler (`pages/callback.vue`)

```typescript
// On mount:
// 1. Extract exchange_code from URL query
// 2. POST /api/auth/callback { exchange_code }
// 3. Receive { token (JWT), user (profile + role) }
// 4. Store in Pinia auth store + cookie
// 5. Redirect to role-based dashboard:
//    - TREASURER → /dashboard/treasurer
//    - CAPTAIN → /dashboard/treasurer (shared view with co-approval)
//    - CBO_AUDITOR → /dashboard/cbo
```

### 2.3 Auth Store (`stores/auth.store.ts`)

```typescript
interface AuthState {
  token: string | null;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'TREASURER' | 'CAPTAIN' | 'CBO_AUDITOR' | 'CITIZEN';
    barangayPsgc: string;
    municipalityPsgc: string;
    mobile: string;
    photoUrl: string;
  } | null;
}
```

### 2.4 Auth Middleware (`middleware/auth.global.ts`)

- If no token in store/cookie → redirect to `/login`
- If token exists → validate not expired
- Exception: `/login` and `/callback` pages skip this

### 2.5 Role Middleware (`middleware/role.ts`)

```typescript
// Usage: definePageMeta({ middleware: ['role'], roles: ['CBO_AUDITOR'] })
// If user.role not in allowed roles → redirect to /dashboard
```

---

## Task 3: Treasurer Dashboard & Budget Management

### 3.1 Treasurer Dashboard (`pages/dashboard/treasurer.vue`)

Layout:
```
┌─────────────────────────────────────────────────────────┐
│ Header: "Welcome back, {firstName}" + Logout             │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ Active Budget│  │ SK Fund     │  │ Calamity Fund   │  │
│  │ Status: DRAFT│  │ ₱X / ₱Y    │  │ ₱X / ₱Y        │  │
│  │ FY 2026     │  │ [progress]  │  │ [progress]      │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Quick Actions                                       │  │
│  │ [Create Budget] [View Disbursements] [Upload Doc]  │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Recent Activity (last 5 audit log entries)          │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Budget Creation Form (`pages/budgets/create.vue`)

Fields:
- Fiscal Year (dropdown: current year, next year)
- Estimated National NTA (₱ currency input)
- Estimated City RPT Share (₱ currency input)  
- Estimated Local Fees (₱ currency input)

**Real-time calculated preview (client-side):**
- Total Approved Budget = sum of all three
- SK Allocation Ceiling (10%) = total × 0.10
- Calamity Allocation Ceiling (5%) = total × 0.05
- General Fund Available = total - SK - Calamity

### 3.3 Budget Detail (`pages/budgets/[id].vue`)

Displays:
- Revenue breakdown with visualizations
- Statutory cap meters (progress bars showing used vs. ceiling)
- Status badge with state history timeline
- Actions based on status:
  - DRAFT: "Edit" + "Submit for Review" button
  - SUBMITTED: "Awaiting CBO Review" (no actions)
  - OPERATIVE: "Create Disbursement" button
  - ARCHIVED: "View Only" + blockchain hash badge

### 3.4 StatutoryCapMeter Component

```vue
<!-- components/budget/StatutoryCapMeter.vue -->
<!-- Props: label, spent, ceiling, color -->
<!-- Shows: progress bar, ₱spent / ₱ceiling, percentage -->
<!-- Visual: Green (<70%), Yellow (70-90%), Red (>90%) -->
```

---

## Task 4: Budget Submission Flow (Face Liveness + eVerify)

### 4.1 Submit Page (`pages/budgets/submit.vue`)

Multi-step wizard:

```
Step 1: Review Budget Summary
  - Display all revenue inputs and calculated caps
  - Confirm checkbox: "I certify this data is accurate"
  
Step 2: Identity Verification
  - Button: "Start Face Liveness Check"
  - Opens LivenessModal component
  
Step 3: Confirmation
  - Display verification result (green checkmark)
  - Final "Submit Budget" button
  - On success: redirect to budget detail with SUBMITTED status
```

### 4.2 LivenessModal Component (`components/identity/LivenessModal.vue`)

```typescript
// Flow:
// 1. Call backend POST /api/identity/liveness/create
// 2. Receive { token, url }
// 3. Open URL in iframe or new window (eGov hosted liveness page)
// 4. Listen for redirect back to callback_url
// 5. Poll backend GET /api/identity/liveness/result/{token}
// 6. If status=SUCCEEDED && score>=95 → emit 'verified' with token
// 7. If failed → show error, allow retry

// Props: { callbackUrl: string }
// Emits: { 'verified': (sessionToken: string) => void, 'failed': () => void }
```

### 4.3 VerifyFlow Component (`components/identity/VerifyFlow.vue`)

```typescript
// After liveness passes:
// 1. Collect user demographics (pre-filled from auth profile)
// 2. Call backend POST /api/identity/verify
//    { first_name, middle_name, last_name, suffix, birth_date, face_liveness_session_id }
// 3. On success → emit 'identity-verified'
// 4. On failure → show "Identity could not be verified" + retry option
```

---

## Task 5: Disbursement Module

### 5.1 Disbursement List (`pages/disbursements/index.vue`)

- Table: project name, fund category, amount, payee, status, date
- Filter by fund_category (SK_FUND, CALAMITY_FUND, GENERAL_FUND)
- Fund cap summary at top (three progress bars)

### 5.2 Disbursement Creation (`pages/disbursements/create.vue`)

Fields:
- Project Name (text)
- Project Description (textarea)
- Fund Category (select: SK_FUND, CALAMITY_FUND, GENERAL_FUND)
- Amount (₱ currency input)
- Payee / Supplier Name (text)
- Voucher Reference Number (text)
- Voucher Document (file upload → calls `/api/ai/extract-document`)

**Validation before submission:**
- Amount must not exceed remaining ceiling for selected fund_category
- Show real-time: "Remaining SK ceiling: ₱XX,XXX" based on category selection

**After form valid:**
- Trigger Face Liveness + eVerify flow (same as budget submission)
- On verification success → POST to create disbursement endpoint

### 5.3 VoucherUpload Component

```typescript
// 1. User selects file (JPEG, PNG, PDF)
// 2. Upload to backend POST /api/ai/extract-document (multipart)
// 3. Backend calls eGov AI Document Extractor
// 4. Response: extracted fields (payee, amount, date, reference)
// 5. Pre-fill form fields with AI-extracted data
// 6. User confirms/corrects extracted values
// 7. Show "AI Extracted" badge next to pre-filled fields
```

### 5.4 Captain Co-Approval (for disbursements ≥ ₱50,000)

- Captain sees pending disbursements requiring co-approval
- Detail view shows: project info, amount, verification evidence
- "Approve" button → submits to `/api/disbursements/:id/approve`
- No separate liveness required for Captain (in-app confirmation only)

---

## Task 6: CBO Dashboard

### 6.1 CBO Home (`pages/dashboard/cbo.vue`)

Layout:
```
┌─────────────────────────────────────────────────────────────┐
│ Header: "City Budget Office — {LGU Name}" + COMPASS badge    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌──────────┐  │
│  │ Total Brgy│  │ Pending   │  │ Operative │  │ Macro    │  │
│  │ Budgets   │  │ Review    │  │ Budgets   │  │ Ceiling  │  │
│  │    32     │  │    5      │  │    20     │  │ ₱XXX.XM  │  │
│  └───────────┘  └───────────┘  └───────────┘  └──────────┘  │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Pending Reviews (SUBMITTED budgets awaiting approval)   │  │
│  │ [Brgy. Poblacion — FY2026 — ₱2.5M — Review]           │  │
│  │ [Brgy. San Jose — FY2026 — ₱1.8M — Review]            │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Compliance Overview (all barangays under this LGU)      │  │
│  │ Donut chart: DRAFT / SUBMITTED / OPERATIVE / ARCHIVED   │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Budget Review Screen (CBO)

Split view:
```
┌────────────────────────────┬────────────────────────────┐
│  BARANGAY BUDGET           │  DBM COMPASS DATA          │
│                            │                            │
│  Brgy: Poblacion           │  NTA Ceiling: ₱X.XM       │
│  FY: 2026                  │  LGSF Allocation: ₱X.XM   │
│  NTA Estimate: ₱X.XM      │  Last Synced: 2h ago       │
│  RPT Share: ₱X.XM         │                            │
│  Local Fees: ₱X.XM        │  Proportional Check:       │
│  ─────────────────         │  Budget vs Ceiling: ✅ OK  │
│  TOTAL: ₱X.XM             │  (or ⚠️ Exceeds ceiling)  │
│  SK Cap: ₱X.XM (10%)      │                            │
│  Calamity: ₱X.XM (5%)     │                            │
│                            │                            │
│  [Approve] [Reject+Reason] │  [Refresh COMPASS Data]   │
└────────────────────────────┴────────────────────────────┘
```

### 6.3 COMPASS Data Explorer (`pages/compass/index.vue`)

- Tab 1: NCA Records table with filters (budgetYear, deptCode)
- Tab 2: SAAODB Dashboard Summary (pie charts: appropriations breakdown)
- Tab 3: LGSF Records (table + KPI cards: totalReleased, projectsCount, lguCount)
- "Sync Now" button triggers `/api/compass/sync/:lguId`
- Display `compass_last_synced_at` timestamp

### 6.4 Audit Trail Viewer (`pages/audit/index.vue`)

- Timeline view of all state transitions
- Each entry shows: timestamp, action, user, entity, blockchain hash
- BlockchainBadge component: shows hash with "Verified on eGovchain" tooltip
- Filter by: entity type, action type, date range, user

---

## Task 7: Notification Center

### 7.1 Notification Page (`pages/notifications/index.vue`)

- List of all SMS notifications sent to/about current user
- Columns: date, event type, message preview, delivery status
- Bell icon in header with unread count badge

---

## Task 8: Common Components & Styling

### 8.1 Design Tokens (TailwindCSS)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: { 50: '#eff6ff', 500: '#3b82f6', 700: '#1d4ed8' },
        success: { 500: '#22c55e' },
        warning: { 500: '#f59e0b' },
        danger: { 500: '#ef4444' },
        egov: { blue: '#1a56db', gold: '#d4a843' },
      }
    }
  }
}
```

### 8.2 Responsive Breakpoints

- Mobile-first (360px minimum)
- Tablet: 768px (sidebar collapses to hamburger)
- Desktop: 1024px (full sidebar)

### 8.3 Shared Components Behavior

| Component | Behavior |
|-----------|----------|
| `StatusBadge` | Color-coded pill: DRAFT=gray, SUBMITTED=yellow, OPERATIVE=green, ARCHIVED=blue |
| `FundCapProgress` | Progress bar with dynamic color (green→yellow→red) |
| `BlockchainBadge` | Truncated hash with copy button + "Anchored on eGovchain" label |
| `DataTable` | Sortable, paginated, searchable table wrapper |
| `ConfirmModal` | Generic modal with confirm/cancel for dangerous actions |
| `LoadingSpinner` | Centered spinner with optional message text |

---

## Deliverables Checklist

- [ ] Nuxt 3 project running on Laptop 2
- [ ] eGovPH SSO login → callback → JWT stored → role-based redirect
- [ ] Treasurer dashboard with budget status + cap meters
- [ ] Budget CRUD: create, edit (DRAFT), view detail
- [ ] Budget submission flow: review → liveness iframe → eVerify → submit
- [ ] Disbursement creation with fund cap validation + AI document extraction
- [ ] CBO dashboard: pending reviews, compliance overview, COMPASS sidebar
- [ ] CBO budget review: split view with COMPASS cross-reference
- [ ] CBO approve/reject actions with SMS confirmation
- [ ] Audit trail timeline with blockchain hash badges
- [ ] COMPASS data explorer (NCA, SAAODB, LGSF tabs)
- [ ] Notification center
- [ ] Responsive design (mobile-first, works at 360px)
- [ ] Filipino default language (static strings)

---

## Integration Contract with Backend (Laptop 1)

### Headers Required
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Error Handling
```typescript
// All errors from backend follow:
{ "success": false, "error": { "code": "ERROR_CODE", "message": "Human readable" } }

// Handle globally in axios interceptor:
// 401 → redirect to /login
// 403 → show "Access denied" toast
// 422 → show validation errors inline
// 500 → show "Something went wrong" toast
```

### Key API Calls from This Frontend
```
POST /api/auth/callback              → Login
GET  /api/auth/me                    → Get profile
GET  /api/budgets                    → List budgets
POST /api/budgets                    → Create budget
PUT  /api/budgets/:id                → Update budget
POST /api/budgets/:id/submit         → Submit budget
POST /api/budgets/:id/approve        → CBO approve
POST /api/budgets/:id/reject         → CBO reject
GET  /api/budgets/:id/disbursements  → List disbursements
POST /api/budgets/:id/disbursements  → Create disbursement
POST /api/identity/liveness/create   → Start liveness
GET  /api/identity/liveness/result/X → Poll result
POST /api/identity/verify            → eVerify
POST /api/ai/extract-document        → Upload voucher
GET  /api/compass/nca/:lguId         → NCA data
GET  /api/compass/saaodb/dashboard   → SAAODB summary
GET  /api/compass/lgsf               → LGSF data
POST /api/compass/sync/:lguId        → Trigger sync
GET  /api/audit/logs                 → Audit trail
GET  /api/notifications              → Notification history
```
