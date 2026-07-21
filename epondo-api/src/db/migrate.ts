import { db } from './connection.js';

const MIGRATION_SQL = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    egovph_imguid VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
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
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_barangay ON users(barangay_psgc);

-- PARENT LGUs
CREATE TABLE IF NOT EXISTS parent_lgus (
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
`;

const MIGRATION_SQL_2 = `
-- BARANGAY BUDGETS
CREATE TABLE IF NOT EXISTS barangay_budgets (
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
CREATE INDEX IF NOT EXISTS idx_budgets_status ON barangay_budgets(budget_status);
CREATE INDEX IF NOT EXISTS idx_budgets_lgu ON barangay_budgets(parent_lgu_id);
CREATE INDEX IF NOT EXISTS idx_budgets_fiscal_year ON barangay_budgets(fiscal_year);
`;

const MIGRATION_SQL_3 = `
-- PROJECT DISBURSEMENTS
CREATE TABLE IF NOT EXISTS project_disbursements (
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
CREATE INDEX IF NOT EXISTS idx_disbursements_budget ON project_disbursements(barangay_budget_id);
CREATE INDEX IF NOT EXISTS idx_disbursements_fund ON project_disbursements(fund_category);
CREATE INDEX IF NOT EXISTS idx_disbursements_status ON project_disbursements(status);

-- AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
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
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(performed_by);

-- NOTIFICATION LOGS
CREATE TABLE IF NOT EXISTS notification_logs (
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
CREATE TABLE IF NOT EXISTS compass_sync_history (
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
`;

async function migrate() {
  console.log('🗄️  Running database migrations...');
  try {
    await db.raw(MIGRATION_SQL);
    console.log('  ✅ Users + Parent LGUs created');
    await db.raw(MIGRATION_SQL_2);
    console.log('  ✅ Barangay Budgets created');
    await db.raw(MIGRATION_SQL_3);
    console.log('  ✅ Disbursements + Audit + Notifications + COMPASS History created');
    console.log('🎉 All migrations complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await db.destroy();
  }
}

migrate();
