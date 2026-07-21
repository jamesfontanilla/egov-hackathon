# BudgetTrack / ePondo Presentation Walkthrough

> **Purpose:** A concise speaker guide for a 7–10 minute eGovHackathon presentation.
> **Tip:** Keep the live demo focused on one budget moving from creation to citizen visibility.

---

## 1. Team Introduction — 30 seconds

### Suggested slide title

**BudgetTrack / ePondo: Trust from national allocation to barangay project**

### Speaker notes

“We are **[Team Name]**, and we built BudgetTrack, also called ePondo: a financial compliance and project-tracking platform for LGUs and their barangays. Our team combines product, frontend, backend, and integration work to address a problem felt at the closest level of government: how public funds become visible, compliant projects.”

### Show

- Team members, roles, and the product name.
- A one-line promise: **Plan correctly. Approve securely. Spend transparently.**

---

## 2. Problem Statement — 1 minute

### Suggested slide title

**The last mile of public spending is difficult to see and verify**

### Speaker notes

“National systems can show macro-level funding releases, but it is hard to connect those figures to a barangay’s budget, disbursements, vouchers, and actual projects. This creates three gaps.

First, budget rules are often calculated manually. Required allocations such as the SK and calamity funds can be miscomputed or exceeded.

Second, high-impact approvals need stronger identity assurance and a reliable audit trail.

Third, citizens can see projects in their community but lack a structured, traceable way to flag delayed, incomplete, or suspicious work.”

### Key points to say

- **Allocation-to-execution gap:** national ceilings do not automatically translate into barangay-level monitoring.
- **Compliance gap:** manual spreadsheets are vulnerable to calculation and workflow errors.
- **Trust gap:** officials, auditors, and citizens lack one shared source of truth.

### Show

```text
National allocation → LGU budget → Barangay disbursement → Community project
       visible             fragmented                 difficult to verify
```

---

## 3. Proposed Solution — 1 minute

### Suggested slide title

**One governed lifecycle for every barangay budget**

### Speaker notes

“BudgetTrack connects officials, auditors, and citizens around one governed budget lifecycle. Treasurers prepare a budget; the platform calculates statutory ceilings; the City Budget Office reviews against macro funding data; approved budgets unlock controlled disbursements; and citizens can follow projects and submit verified reports.”

### Product capabilities

| User | What BudgetTrack gives them |
|---|---|
| Barangay Treasurer | Guided budget creation, document checks, and controlled disbursements |
| Barangay Captain | Visibility and co-approval for major disbursements |
| City Budget Officer / Auditor | LGU-wide review, compliance checks, and an audit trail |
| Citizen | Public project visibility, budget assistance, and verified reporting |

### Show

```text
DRAFT → SUBMITTED → OPERATIVE → ARCHIVED
  prepare    verify       spend        seal
```

---

## 4. Proposed Solution & Integration to eGOVPH — 2 minutes

### Suggested slide title

**eGOVPH services make each control practical, not just procedural**

### Speaker notes

“We designed BudgetTrack as an integration layer, not an isolated dashboard. Each eGOVPH service is used at the moment it provides the most value: identity when an official submits or approves, national funding data when an auditor validates a budget, messaging when action is required, and citizen-reporting services when a project needs public scrutiny.”

### Integration matrix

| eGOVPH service | BudgetTrack use | Value created |
|---|---|---|
| NationalID eVerify | Validates an official’s identity for sensitive actions | Stronger accountability for approvals |
| Face Liveness | Confirms a real person is present during submission or authorization | Reduces impersonation and spoofing risk |
| DBM COMPASS | Supplies macro NTA/LGSF context for the parent LGU | Connects local budgets to funding baselines |
| eGovchain | Anchors budget and disbursement state hashes | Tamper-evident audit evidence |
| eMessage | Notifies CBOs, treasurers, captains, and citizens | Faster action and fewer missed reviews |
| eReport | Supports OTP-verified, geotagged citizen reports | Structured civic oversight and case tracking |
| eGov AI | Extracts voucher data and answers/translates budget questions | Less manual encoding and more accessible information |

### Demo narration: one budget journey

1. The treasurer creates a **Draft** and enters revenue estimates.
2. BudgetTrack automatically calculates the **10% SK** and **5% calamity** ceilings.
3. On submission, the officer completes **Face Liveness** and **NationalID eVerify**; **eMessage** alerts the CBO.
4. The CBO checks the budget against **DBM COMPASS**, approves it, and the approval is anchored through **eGovchain**.
5. The budget becomes **Operative** and can fund controlled project disbursements.
6. Citizens can view the project and use **eReport** to flag a potential issue.

### Important wording for judges

Describe integrations as **implemented where credentials/endpoints are available, with service adapters and mock/fallback behavior for sandbox or unavailable services**. Do not claim production government deployment unless it has been authorized.

---

## 5. Impact, Value & Cost Benefit — 1.5 minutes

### Suggested slide title

**Better controls before money moves, better visibility after it moves**

### Speaker notes

“The value is not another reporting layer. BudgetTrack moves controls earlier in the process. It prevents invalid fund allocations before disbursement, gives auditors an organized evidence trail, and gives citizens a credible channel for feedback.”

### Impact by stakeholder

| Stakeholder | Impact |
|---|---|
| LGUs and barangays | Consistent budget workflow and automated statutory-cap calculations |
| Auditors | Faster retrieval of approvals, state changes, and supporting audit logs |
| Officials | Fewer manual follow-ups through event-triggered notifications |
| Citizens | Greater project visibility and a documented feedback path |

### Cost-benefit framing

- **Avoided rework:** validation and document extraction reduce repeated manual encoding and correction cycles.
- **Avoided compliance exposure:** hard-coded ceilings and state transitions make out-of-policy actions harder to execute.
- **Lower audit retrieval cost:** approval, verification, and transaction evidence are associated with the budget record.
- **Reuse of shared government services:** integrations avoid duplicating capabilities such as identity verification, messaging, reporting, and AI extraction.

### Suggested measurable pilot KPIs

Use actual pilot results when available; otherwise label these as targets.

- Percentage of budgets with automatically computed statutory allocations
- Time from budget submission to CBO decision
- Percentage of high-risk actions with completed identity and liveness checks
- Number and resolution time of citizen project reports
- Time required to retrieve a complete audit trail for a budget or disbursement

---

## 6. Implementation & Scalability — 1.5 minutes

### Suggested slide title

**Built as a modular, multi-tenant platform that can grow by LGU**

### Speaker notes

“The implementation separates user experiences from the business rules and external integrations. This lets us improve one service or add an LGU without rebuilding the whole platform.”

### Current architecture

```text
Citizen portal (Nuxt) ─┐
Official portal (Nuxt) ├── ePondo API (Fastify / TypeScript)
eBantay portal (Next) ─┘          │
                                  ├── PostgreSQL: budgets, caps, audit logs
                                  ├── Redis / queues: cache and background jobs
                                  └── eGOVPH service adapters
```

### Scalability story

- **Multi-tenant data model:** parent LGU and barangay identifiers scope records and roles.
- **API-first services:** web clients communicate through a single backend; external APIs are not exposed to browsers.
- **Stateless application layer:** API instances can be replicated behind a load balancer.
- **Async processing:** notifications and recurring DBM COMPASS synchronization can run through queues.
- **Audit-ready storage:** PostgreSQL holds structured operational records while eGovchain anchoring supports independent verification.
- **Low-connectivity roadmap:** local/offline capture and later synchronization can support barangays with unreliable connections.

### Security and governance controls

- Role-based access control for treasurers, captains, auditors, and citizens
- JWT-based sessions and server-side storage of integration credentials
- Biometric/identity verification for high-risk transitions
- Immutable-style state hashes plus application audit logs
- Data minimization and access controls aligned with privacy obligations

---

## 7. Closing — 30 seconds

### Suggested slide title

**From allocation to accountability**

### Speaker notes

“BudgetTrack gives LGUs a practical way to turn national funding context into compliant, transparent barangay execution. It helps officials make safer decisions, gives auditors better evidence, and gives citizens a meaningful place in project accountability. With eGOVPH integrations, we are not just digitizing forms—we are building trust into the lifecycle of public funds.”

### Close with

**BudgetTrack / ePondo: Plan correctly. Approve securely. Spend transparently.**

---

## Optional 60-second live demo checklist

1. Open the official portal and show a draft budget.
2. Point out the automatically calculated SK and calamity fund ceilings.
3. Submit the budget and show the verification/notification flow or its recorded result.
4. Open the CBO view, approve the budget, and show its Operative state and audit entry.
5. Open the citizen or eBantay view and show project visibility or a report submission flow.

If a remote eGOVPH sandbox is unavailable during the presentation, show the saved integration response, audit event, or mock adapter result and state that the workflow is designed to use the production credentialed service.
