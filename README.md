# 🇵🇭 BudgetTrack — Local Governance Financial Compliance & Project Tracking System

> **Target Event:** eGovHackathon 2026 (DICT)
> **Status:** Active Development

---

## 📌 Overview

**BudgetTrack** is a multi-tenant, decentralized financial compliance and public project tracking system for Local Government Units (LGUs) and their component Barangays in the Philippines.

It bridges the visibility gap between national macro-funding allocations (DBM COMPASS) and local project execution at the barangay level — ensuring statutory budget allocations are automatically calculated, transparently managed, and open to civic oversight.

---

## 🚩 Core Problems Solved

| Problem | Impact |
|---------|--------|
| **Macro vs. Micro Gap** | No programmatic bridge between DBM data and local barangay disbursements |
| **Compliance Risk** | Manual, error-prone calculations for RA 7160 / RA 10742 / RA 10121 statutory caps |
| **Audit & Transparency Vacuum** | Grassroots projects lack immutable execution logs |
| **Identity Fraud in Approvals** | Budget approvals lack biometric verification |
| **Citizen Disconnect** | No structured channel for citizens to flag ghost projects or delays |

---

## 🛠️ eGov API Integrations

| API | Role |
|-----|------|
| **Local Auth** | Email/password authentication with JWT sessions and RBAC |
| **NationalID eVerify** | PhilSys identity validation for high-security actions |
| **Face Liveness** | Biometric anti-spoofing (confidence ≥ 95.0) |
| **DBM COMPASS** | Macro budget baseline / NTA ceiling polling |
| **eGovchain** | Hyperledger Besu immutable audit trail |
| **eMessage** | SMS/email notifications to officials and citizens |
| **eReport** | Geotagged citizen complaint filing with OTP verification |
| **eGov AI** | OCR document extraction + multilingual budget assistant |

---

## 🔄 4-Stage Budget Lifecycle

```
[ DRAFT ] → [ SUBMITTED ] → [ OPERATIVE ] → [ ARCHIVED ]
```

1. **DRAFT** — Treasurer inputs revenue estimates; eGov AI validates attachments
2. **SUBMITTED** — Face Liveness + NationalID eVerify required; CBO notified via SMS
3. **OPERATIVE** — CBO approves after DBM COMPASS check; state anchored on eGovchain; disbursements unlocked
4. **ARCHIVED** — Fiscal year-end seal; permanent vault lock on eGovchain

---

## 📊 Statutory Compliance (Auto-Enforced)

| Statute | Requirement | Implementation |
|---------|-------------|----------------|
| RA 7160 | 4-stage budget lifecycle | State machine with DB constraints |
| RA 10742 | 10% SK Allocation | `sk_allocation_ceiling` DB generated column |
| RA 10121 | 5% Calamity Fund | `calamity_allocation_ceiling` DB generated column |
| RA 10173 (DPA) | Data privacy protection | Encrypted storage, RBAC, audit logs |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Nuxt 3 (Vue.js) — SSR + PWA |
| Backend | Node.js (Fastify) or Python (FastAPI) |
| Database | PostgreSQL 15+ (generated columns, UUID, JSONB) |
| Cache | Redis |
| Job Queue | BullMQ / Celery |
| Deployment | Docker + Cloud (AWS/GCP) |

---

## 👥 User Roles

| Role | Description |
|------|-------------|
| **Barangay Treasurer** | Creates/submits budget profiles, authorizes disbursements |
| **Barangay Captain** | Co-signs disbursements, oversees financial operations |
| **City Budget Officer (CBO)** | Reviews/approves budgets, cross-references DBM COMPASS |
| **CBO Auditor** | Read-only audit and compliance monitoring |
| **Citizen** | Views public projects, files geotagged complaints, uses AI assistant |

---

## 📁 Repository Structure

```
├── prd.md              # Product Requirements Document (v1.0)
├── project-idea.md     # Project Blueprint & Architecture
├── README.md           # This file
└── docs/               # Additional documentation (coming soon)
```

---

## 📋 Key Documents

- [`prd.md`](./prd.md) — Full Product Requirements Document with API specs, DB schema, UI flows, and security architecture
- [`project-idea.md`](./project-idea.md) — Project blueprint with system architecture diagrams and team action items

---

## 🤝 Team Action Items

- [ ] Offline Synchronization Protocol (IndexedDB/SQLite for low-connectivity barangays)
- [ ] eGov AI Document Parsing Criteria (min resolution, supported formats)
- [ ] CBO Dashboard Analytics (LGU-wide compliance ratios, spending velocity)
- [ ] RBAC Permissions Matrix (local account role mapping)

---

*Built for eGovHackathon 2026 — Department of Information and Communications Technology (DICT), Philippines*
