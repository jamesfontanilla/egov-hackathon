Here is a structured, production-ready **PROJECT_BLUEPRINT.md** document tailored for your team's review and technical refinement.
It compiles all validated APIs, statutory requirements, database schema definitions, and workflow constraints into a clean Markdown file.
### File Content: PROJECT_BLUEPRINT.md
```markdown
# 🇵🇭 Project Blueprint: Local Governance Financial Compliance & Project Tracking System
> **Hackathon Status:** Draft / Internal Review  
> **Target Event:** eGovHackathon 2026 (DICT)  
> **Note:** This document is an active draft subject to team refinement, technical clarification, and feature expansion.
---
## 📌 1. Project Overview & Scope
### 1.1 Executive Summary
This platform serves as a multi-tenant, decentralized financial compliance and public project tracking system for Local Government Units (LGUs) and their component Barangays. It bridges the visibility gap between national macro-funding allocations and local project execution, ensuring statutory budget allocations (e.g., 10% SK Allocation, 5% Calamity Fund) are strictly calculated, transparently managed, and opened to civic oversight.
### 1.2 Core Problem Statement
* **Macro vs. Micro Gap:** National allocation systems (DBM COMPASS) monitor spending down to the LGU release level, but lack API visibility into local barangay disbursements and supplier vouchers.
* **Compliance Risk:** Local treasurers and youth councils (SK) face complex manual calculations to satisfy statutory percentage caps under Republic Acts (RA 7160, RA 10742, RA 10121).
* **Audit & Transparency Vacuum:** Grassroots projects often lack immutable execution logs, making citizen feedback and audit tracking reactive rather than preventive.
---
## 🛠️ 2. eGovPH Catalog API Integration Matrix
The system architecture relies **strictly on the 8 verified eGov APIs** available in the official platform catalog:

| Integrated API | Functional Responsibility in Architecture |
| :--- | :--- |
| **`eGovPH`** | **Authentication Gateway**: Single Sign-On (SSO) endpoint providing secure OAuth2 authentication for Barangay Captains, Treasurers, City Budget Officers (CBO), and Citizens using SuperApp credentials. |
| **`NationalID eVerify`** | **Identity Validation**: Validates PhilSys / PhilID tokens before granting elevated privileges for budget creation, submission, or approval. |
| **`FACE LIVENESS`** | **Biometric Anti-Spoofing**: Enforces active liveness verification during high-security state changes (e.g., moving budget to `OPERATIVE` or approving large vouchers). |
| **`DBM COMPASS`** | **Macro Budget Baseline**: Programmatically polls national DBM budget execution data (NTA/LGSF) to set the macro funding ceiling for the parent City/Municipality. |
| **`eGovchain`** | **Immutable Audit Trail**: Anchors budget approval hashes, voucher execution logs, and year-end state transitions onto the zero-fee Hyperledger Besu government blockchain network. |
| **`eMessage`** | **Automated Alerts**: Delivers multi-channel SMS, email, and in-app notifications to officials for pending reviews and to citizens when neighborhood projects start. |
| **`eReport`** | **Civic Oversight**: Enables citizens to submit geotagged, OTP-verified reports or whistleblower complaints regarding delayed, ghost, or substandard local projects. |
| **`eGov AI`** | **Intelligent Assistance**: Analyzes uploaded disbursement vouchers/PO documents via OCR/NLP and provides multilingual conversational guidance for public budget queries. |

> *Note: `eGovPAY` was intentionally excluded from the architecture as it serves as an incoming G2C/B2C biller aggregator rather than an outgoing government disbursement platform.*
---
## 🔄 3. System Architecture & Workflow
### 3.1 High-Level Architecture Diagram
```
┌─────────────────────────────────────────┐
│             USER / CITIZEN              │
└────────────────────┬────────────────────┘
│
┌──────────────────────────┴──────────────────────────┐
▼                                                     ▼
┌──────────────────────┐                               ┌──────────────────────┐
│ OFFICIAL / TREASURER │                               │  PUBLIC CITIZEN VIEW │
└───────────┬──────────┘                               └───────────┬──────────┘
│                                                      │
 1. AUTHENTICATION & IDENTITY                           3. CIVIC OVERSIGHT
   ├─ eGovPH (Single Sign-On)                             ├─ eReport (Flag anomalous projects)
   ├─ NationalID eVerify (PhilSys Verification)           ├─ eMessage (SMS/Email alerts)
   └─ FACE LIVENESS (Biometric Verification)              └─ eGov AI (Document Parsing / NLP)
   │                                                      │
 2. EXECUTION & COMPLIANCE                                         │
   ├─ DBM COMPASS (Macro Ceiling Polling)                            │
   └─ eGovchain (Hyperledger Besu State Hash) ───────────────────────┘
```
### 3.2 The 4-Stage Budget Lifecycle Logic
To prevent premature or unlawful spending, a Barangay budget must transition through a 4-point state machine matching **RA 7160 (Local Government Code)** guidelines:
```
[ 1. DRAFT ] ──────────> [ 2. SUBMITTED ] ─────────> [ 3. OPERATIVE ] ───────> [ 4. ARCHIVED ]
(Barangay inputs          (Locked for Barangay;       (CBO approves;             (Fiscal year closes;
estimated revenues)       eVerify + Liveness Check)   eGovchain State Anchor)    eGovchain Vault Lock)
```
1. **DRAFT (Barangay Preparation)**
   * Treasurer authenticates via **`eGovPH` SSO**.
   * Inputs local revenue estimates (RPT shares, local fees). Spending modules remain **locked**.
   * **`eGov AI`** checks attached supporting documents for formatting errors or anomalies.
2. **SUBMITTED (LGU Verification)**
   * Barangay Treasurer freezes inputs and submits the profile.
   * System enforces **`NationalID eVerify`** and **`FACE LIVENESS`** checks on the submitting official.
   * **`eMessage`** alerts the City Budget Office (CBO) that a review is pending.
3. **OPERATIVE (The Master Switch)**
   * CBO cross-references macro estimates against **`DBM COMPASS`** ceilings.
   * Upon CBO approval, database hardware column constraints calculate statutory caps and unlock project disbursement modules.
   * State approval hash is written to **`eGovchain`**.
4. **ARCHIVED (Year-End Immutable Seal)**
   * At fiscal year-end, remaining balances freeze and transition into continuing appropriations.
   * State is permanently anchored on **`eGovchain`** for Commission on Audit (COA) compliance review.
---
## 🗄️ 4. Database Schema Baseline (PostgreSQL)
```sql
-- Parent LGU (City / Municipality) Authority Profile
CREATE TABLE parent_lgus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    psgc_code VARCHAR(10) UNIQUE NOT NULL,
    macro_nta_ceiling DECIMAL(15, 2) NOT NULL, -- Polled from DBM COMPASS API
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Component Barangay Integrated Budget Profiles
CREATE TABLE barangay_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_lgu_id UUID REFERENCES parent_lgus(id) ON DELETE RESTRICT,
    barangay_name VARCHAR(100) NOT NULL,
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
    ) STORED, -- RA 10742 Mandatory 10%
    
    calamity_allocation_ceiling DECIMAL(15, 2) GENERATED ALWAYS AS (
        (estimated_national_nta + estimated_city_rpt_share + estimated_local_fees) * 0.05
    ) STORED, -- RA 10121 Mandatory 5%
    
    -- State Machine Controls
    budget_status VARCHAR(20) CHECK (
        budget_status IN ('DRAFT', 'SUBMITTED', 'OPERATIVE', 'ARCHIVED')
    ) DEFAULT 'DRAFT',
    
    -- Audit & Blockchain Hash
    egovchain_tx_hash VARCHAR(66), -- Hyperledger Besu state hash
    
    UNIQUE(barangay_name, fiscal_year)
);
-- Local Project Disbursements & Line Item Vouchers
CREATE TABLE project_disbursements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barangay_budget_id UUID REFERENCES barangay_budgets(id) ON DELETE RESTRICT,
    project_name VARCHAR(255) NOT NULL,
    fund_category VARCHAR(50) CHECK (
        fund_category IN ('SK_FUND', 'CALAMITY_FUND', 'GENERAL_FUND')
    ) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    payee_supplier_name VARCHAR(255) NOT NULL,
    voucher_reference VARCHAR(100) NOT NULL,
    
    -- API Security Verification Keys
    authorized_by_philsys_id VARCHAR(100) NOT NULL, -- NationalID eVerify token
    liveness_session_id VARCHAR(100) NOT NULL,    -- FACE LIVENESS token
    egovchain_block_hash VARCHAR(66),             -- Block hash anchor
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```
## 📋 5. Action Items & Team Discussion Points
Before finalized submission, the development team must address the following technical items:
 * [ ] **Offline Synchronization Protocol:** Define mobile client IndexedDB/SQLite schema for low-connectivity provincial barangays pushing data to the API once back online.
 * [ ] **eGov AI Document Parsing Criteria:** Agree on minimum resolution and file formats (.PDF, .JPG) supported when scanning paper purchase orders.
 * [ ] **CBO Dashboard Analytics:** Finalize key metrics shown to the City Budget Officer (e.g., LGU-wide statutory compliance ratios, flagged velocity spikes).
 * [ ] **Role-Based Access Control (RBAC):** Map out internal permissions matrix linking eGovPH user tokens to application role types (TREASURER, CAPTAIN, CBO_AUDITOR, CITIZEN).
```
```
