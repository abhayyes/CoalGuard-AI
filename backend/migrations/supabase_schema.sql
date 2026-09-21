-- CoalGuard AI — Supabase Database Schema & RLS Setup
-- Run this in your Supabase SQL Editor to initialize all tables, types, indexes, and RLS policies.

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. CUSTOM ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'mine_official', 'safety_officer', 'env_officer', 'inspector', 'corporate', 'regulatory', 'contractor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE mine_type_enum AS ENUM ('opencast', 'underground', 'mixed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE compliance_category_enum AS ENUM ('statutory', 'environmental', 'safety', 'operational', 'labor', 'financial');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE compliance_status_enum AS ENUM ('pending', 'in_progress', 'completed', 'overdue');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE risk_level_enum AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE inspection_type_enum AS ENUM ('routine', 'safety', 'environmental', 'special', 'follow_up');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE inspection_status_enum AS ENUM ('draft', 'in_progress', 'completed', 'reviewed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE observation_severity_enum AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE observation_category_enum AS ENUM ('safety', 'environmental', 'structural', 'equipment', 'procedural', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE observation_status_enum AS ENUM ('open', 'action_assigned', 'in_progress', 'resolved', 'verified', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE corrective_action_status_enum AS ENUM ('assigned', 'in_progress', 'completed', 'overdue', 'verified');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE contractor_compliance_status_enum AS ENUM ('compliant', 'non_compliant', 'partially_compliant', 'under_review');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE alert_type_enum AS ENUM ('compliance_due', 'compliance_overdue', 'high_risk_observation', 'contract_expiring', 'corrective_action_overdue', 'ai_anomaly', 'inspection_pending');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE alert_severity_enum AS ENUM ('info', 'warning', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ocr_status_enum AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABLES

-- Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supabase_uid UUID UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    department VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mines
CREATE TABLE IF NOT EXISTS mines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    subsidiary VARCHAR(255),
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    location_description TEXT,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    boundary_geojson JSONB,
    mine_type mine_type_enum,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mine Assignments
CREATE TABLE IF NOT EXISTS mine_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mine_id UUID REFERENCES mines(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_user_mine UNIQUE (user_id, mine_id)
);

-- Compliance
CREATE TABLE IF NOT EXISTS compliance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mine_id UUID NOT NULL REFERENCES mines(id) ON DELETE CASCADE,
    requirement TEXT NOT NULL,
    category compliance_category_enum NOT NULL,
    sub_category VARCHAR(255),
    due_date DATE NOT NULL,
    responsible_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status compliance_status_enum DEFAULT 'pending',
    risk_level risk_level_enum,
    document_url TEXT,
    completion_date DATE,
    completion_notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inspections
CREATE TABLE IF NOT EXISTS inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mine_id UUID NOT NULL REFERENCES mines(id) ON DELETE CASCADE,
    inspector_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    inspection_type inspection_type_enum NOT NULL,
    date DATE NOT NULL,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    checklist_data JSONB,
    summary TEXT,
    status inspection_status_enum DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Observations
CREATE TABLE IF NOT EXISTS observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    severity observation_severity_enum NOT NULL,
    category observation_category_enum DEFAULT 'other',
    photo_urls TEXT[],
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    status observation_status_enum DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Corrective Actions
CREATE TABLE IF NOT EXISTS corrective_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    observation_id UUID NOT NULL REFERENCES observations(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    assigned_to UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    deadline DATE NOT NULL,
    status corrective_action_status_enum DEFAULT 'assigned',
    completion_notes TEXT,
    completion_photo_url TEXT,
    completed_at TIMESTAMPTZ,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contractors
CREATE TABLE IF NOT EXISTS contractors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    mine_id UUID NOT NULL REFERENCES mines(id) ON DELETE CASCADE,
    contract_number VARCHAR(100),
    contract_start DATE NOT NULL,
    contract_end DATE NOT NULL,
    scope_of_work TEXT,
    worker_count INTEGER DEFAULT 0,
    compliance_status contractor_compliance_status_enum DEFAULT 'under_review',
    documents JSONB,
    training_records JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mine_id UUID REFERENCES mines(id) ON DELETE CASCADE,
    type alert_type_enum NOT NULL,
    severity alert_severity_enum NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    is_resolved BOOLEAN DEFAULT FALSE,
    escalation_level INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mine_id UUID REFERENCES mines(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50),
    file_size_bytes INTEGER,
    ocr_status ocr_status_enum DEFAULT 'pending',
    ocr_extracted_text TEXT,
    ocr_extracted_fields JSONB,
    linked_compliance_id UUID REFERENCES compliance(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Risk Scores
CREATE TABLE IF NOT EXISTS risk_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mine_id UUID NOT NULL REFERENCES mines(id) ON DELETE CASCADE,
    overall_score DECIMAL(5, 2) NOT NULL,
    compliance_risk DECIMAL(5, 2),
    safety_risk DECIMAL(5, 2),
    environmental_risk DECIMAL(5, 2),
    historical_risk DECIMAL(5, 2),
    operational_risk DECIMAL(5, 2),
    risk_level risk_level_enum,
    anomalies JSONB,
    recommendations JSONB,
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INDEXES
CREATE INDEX IF NOT EXISTS idx_compliance_mine_status ON compliance(mine_id, status);
CREATE INDEX IF NOT EXISTS idx_compliance_due_date ON compliance(due_date);
CREATE INDEX IF NOT EXISTS idx_inspections_mine_date ON inspections(mine_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_observations_severity ON observations(severity);
CREATE INDEX IF NOT EXISTS idx_observations_status ON observations(status);
CREATE INDEX IF NOT EXISTS idx_corrective_actions_status_deadline ON corrective_actions(status, deadline);
CREATE INDEX IF NOT EXISTS idx_alerts_mine_unresolved ON alerts(mine_id) WHERE is_resolved = FALSE;
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_risk_scores_mine ON risk_scores(mine_id, calculated_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_ocr_status ON documents(ocr_status);
