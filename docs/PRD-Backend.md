# CoalGuard AI — Backend Product Requirements Document

**Version:** 1.0
**Date:** 20 September 2026
**Product:** CoalGuard AI — AI-Based Smart Governance and Compliance Monitoring System for Coal Mines
**Scope:** REST API Server, Database, AI/ML Engine, OCR Pipeline, GIS Services, Alert Engine

---

## 1. Overview

The backend is a Python-based API server that powers all data operations for CoalGuard AI. It serves the web dashboard, field application, and regulatory portal through a RESTful API, and orchestrates background services for AI risk analysis, OCR processing, and automated alerting.

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Language | Python 3.11+ |
| Framework | FastAPI |
| ORM | SQLAlchemy 2.0 (async) |
| Database | PostgreSQL 15+ (via Supabase) |
| Auth | Supabase Auth (JWT verification on backend) |
| File Storage | Supabase Storage |
| AI/ML | Scikit-learn, Pandas, NumPy |
| OCR | Tesseract OCR (pytesseract) + optional Google Cloud Vision API |
| GIS | PostGIS extension, GeoJSON serialization |
| Task Queue | Background tasks via FastAPI BackgroundTasks (MVP); Celery + Redis (post-MVP) |
| Realtime | Supabase Realtime (database changes broadcast to frontend) |
| Testing | Pytest + httpx (async test client) |
| Deployment | Render / Railway |
| CI/CD | GitHub Actions |

---

## 3. System Architecture

```
                     ┌─────────────────────┐
                     │   Supabase Auth      │
                     └──────────┬──────────┘
                                │ JWT
                     ┌──────────▼──────────┐
   Frontend ────────►│   FastAPI Server     │
                     │                      │
                     │  ┌──────────────┐    │
                     │  │ Auth Middleware│   │
                     │  └──────┬───────┘    │
                     │         │            │
                     │  ┌──────▼───────┐    │
                     │  │   Routers     │   │
                     │  │ /auth         │   │
                     │  │ /mines        │   │
                     │  │ /compliance   │   │
                     │  │ /inspections  │   │
                     │  │ /observations │   │
                     │  │ /contractors  │   │
                     │  │ /alerts       │   │
                     │  │ /risk         │   │
                     │  │ /documents    │   │
                     │  │ /reports      │   │
                     │  │ /audit-log    │   │
                     │  │ /assistant    │   │
                     │  └──────┬───────┘    │
                     │         │            │
                     │  ┌──────▼───────┐    │
                     │  │  Services     │   │
                     │  │ ComplianceSvc │   │
                     │  │ InspectionSvc │   │
                     │  │ RiskEngineSvc │   │
                     │  │ OCRSvc        │   │
                     │  │ AlertSvc      │   │
                     │  │ AuditSvc      │   │
                     │  │ GISSvc        │   │
                     │  │ ReportSvc     │   │
                     │  └──────┬───────┘    │
                     └─────────┼────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
   ┌──────────▼──────┐ ┌──────▼──────┐ ┌───────▼──────┐
   │  PostgreSQL      │ │ Supabase    │ │ Background   │
   │  (Supabase DB)   │ │ Storage     │ │ Workers      │
   │  + PostGIS       │ │ (files)     │ │ (AI, OCR,    │
   │                  │ │             │ │  Alerts)     │
   └──────────────────┘ └─────────────┘ └──────────────┘
```

---

## 4. Database Schema

### 4.1 Entity-Relationship Overview

```
Users ──< MineAssignments >── Mines
Mines ──< Compliance
Mines ──< Inspections ──< Observations
Observations ──< CorrectiveActions
Mines ──< Contractors ──< ContractorDocuments
Mines ──< Alerts
Mines ──< Documents
All entities ──< AuditLogs
Mines ──< RiskScores
```

### 4.2 Table Definitions

#### `users`

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() |
| `supabase_uid` | UUID | UNIQUE, NOT NULL (maps to Supabase Auth user) |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL |
| `full_name` | VARCHAR(255) | NOT NULL |
| `role` | ENUM('admin', 'mine_official', 'safety_officer', 'env_officer', 'inspector', 'corporate', 'regulatory', 'contractor') | NOT NULL |
| `department` | VARCHAR(100) | |
| `phone` | VARCHAR(20) | |
| `is_active` | BOOLEAN | DEFAULT TRUE |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() |

#### `mines`

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK |
| `name` | VARCHAR(255) | NOT NULL |
| `code` | VARCHAR(50) | UNIQUE |
| `subsidiary` | VARCHAR(255) | |
| `state` | VARCHAR(100) | NOT NULL |
| `district` | VARCHAR(100) | |
| `location_description` | TEXT | |
| `latitude` | DECIMAL(10,7) | NOT NULL |
| `longitude` | DECIMAL(10,7) | NOT NULL |
| `boundary_geojson` | JSONB | GeoJSON polygon |
| `mine_type` | ENUM('opencast', 'underground', 'mixed') | |
| `is_active` | BOOLEAN | DEFAULT TRUE |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() |

#### `mine_assignments`

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID | FK → users.id |
| `mine_id` | UUID | FK → mines.id |
| `assigned_at` | TIMESTAMPTZ | DEFAULT NOW() |
| UNIQUE(user_id, mine_id) | | |

#### `compliance`

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK |
| `mine_id` | UUID | FK → mines.id, NOT NULL |
| `requirement` | TEXT | NOT NULL |
| `category` | ENUM('statutory', 'environmental', 'safety', 'operational', 'labor', 'financial') | NOT NULL |
| `sub_category` | VARCHAR(255) | |
| `due_date` | DATE | NOT NULL |
| `responsible_user_id` | UUID | FK → users.id |
| `status` | ENUM('pending', 'in_progress', 'completed', 'overdue') | DEFAULT 'pending' |
| `risk_level` | ENUM('low', 'medium', 'high', 'critical') | |
| `document_url` | TEXT | Supabase Storage URL |
| `completion_date` | DATE | |
| `completion_notes` | TEXT | |
| `created_by` | UUID | FK → users.id |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() |

#### `inspections`

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK |
| `mine_id` | UUID | FK → mines.id, NOT NULL |
| `inspector_id` | UUID | FK → users.id, NOT NULL |
| `inspection_type` | ENUM('routine', 'safety', 'environmental', 'special', 'follow_up') | NOT NULL |
| `date` | DATE | NOT NULL |
| `latitude` | DECIMAL(10,7) | |
| `longitude` | DECIMAL(10,7) | |
| `checklist_data` | JSONB | Checklist items with pass/fail/na + notes |
| `summary` | TEXT | |
| `status` | ENUM('draft', 'in_progress', 'completed', 'reviewed') | DEFAULT 'draft' |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() |

#### `observations`

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK |
| `inspection_id` | UUID | FK → inspections.id, NOT NULL |
| `description` | TEXT | NOT NULL |
| `severity` | ENUM('low', 'medium', 'high', 'critical') | NOT NULL |
| `category` | ENUM('safety', 'environmental', 'structural', 'equipment', 'procedural', 'other') | DEFAULT 'other' |
| `photo_urls` | TEXT[] | Array of Supabase Storage URLs |
| `latitude` | DECIMAL(10,7) | |
| `longitude` | DECIMAL(10,7) | |
| `status` | ENUM('open', 'action_assigned', 'in_progress', 'resolved', 'verified', 'closed') | DEFAULT 'open' |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() |

#### `corrective_actions`

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK |
| `observation_id` | UUID | FK → observations.id, NOT NULL |
| `description` | TEXT | NOT NULL |
| `assigned_to` | UUID | FK → users.id, NOT NULL |
| `assigned_by` | UUID | FK → users.id, NOT NULL |
| `deadline` | DATE | NOT NULL |
| `status` | ENUM('assigned', 'in_progress', 'completed', 'overdue', 'verified') | DEFAULT 'assigned' |
| `completion_notes` | TEXT | |
| `completion_photo_url` | TEXT | |
| `completed_at` | TIMESTAMPTZ | |
| `verified_by` | UUID | FK → users.id |
| `verified_at` | TIMESTAMPTZ | |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() |

#### `contractors`

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK |
| `name` | VARCHAR(255) | NOT NULL |
| `mine_id` | UUID | FK → mines.id, NOT NULL |
| `contract_number` | VARCHAR(100) | |
| `contract_start` | DATE | NOT NULL |
| `contract_end` | DATE | NOT NULL |
| `scope_of_work` | TEXT | |
| `worker_count` | INTEGER | DEFAULT 0 |
| `compliance_status` | ENUM('compliant', 'non_compliant', 'partially_compliant', 'under_review') | DEFAULT 'under_review' |
| `documents` | JSONB | Array of {name, url, expiry} |
| `training_records` | JSONB | Array of {training, date, workers} |
| `is_active` | BOOLEAN | DEFAULT TRUE |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() |

#### `alerts`

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK |
| `mine_id` | UUID | FK → mines.id |
| `type` | ENUM('compliance_due', 'compliance_overdue', 'high_risk_observation', 'contract_expiring', 'corrective_action_overdue', 'ai_anomaly', 'inspection_pending') | NOT NULL |
| `severity` | ENUM('info', 'warning', 'critical') | NOT NULL |
| `title` | VARCHAR(255) | NOT NULL |
| `message` | TEXT | NOT NULL |
| `related_entity_type` | VARCHAR(50) | e.g., 'compliance', 'observation', 'contractor' |
| `related_entity_id` | UUID | |
| `is_read` | BOOLEAN | DEFAULT FALSE |
| `is_resolved` | BOOLEAN | DEFAULT FALSE |
| `escalation_level` | INTEGER | DEFAULT 0 (0=field, 1=mine mgr, 2=corporate) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |
| `resolved_at` | TIMESTAMPTZ | |

#### `documents`

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK |
| `mine_id` | UUID | FK → mines.id |
| `uploaded_by` | UUID | FK → users.id |
| `file_name` | VARCHAR(255) | NOT NULL |
| `file_url` | TEXT | NOT NULL (Supabase Storage) |
| `file_type` | VARCHAR(50) | e.g., 'pdf', 'jpg', 'png' |
| `file_size_bytes` | INTEGER | |
| `ocr_status` | ENUM('pending', 'processing', 'completed', 'failed') | DEFAULT 'pending' |
| `ocr_extracted_text` | TEXT | Full extracted text |
| `ocr_extracted_fields` | JSONB | Structured fields: {doc_type, mine, authority, valid_until, ...} |
| `linked_compliance_id` | UUID | FK → compliance.id |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() |

#### `risk_scores`

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK |
| `mine_id` | UUID | FK → mines.id, NOT NULL |
| `overall_score` | DECIMAL(5,2) | 0.00–100.00 |
| `compliance_risk` | DECIMAL(5,2) | |
| `safety_risk` | DECIMAL(5,2) | |
| `environmental_risk` | DECIMAL(5,2) | |
| `historical_risk` | DECIMAL(5,2) | |
| `operational_risk` | DECIMAL(5,2) | |
| `risk_level` | ENUM('low', 'medium', 'high', 'critical') | |
| `anomalies` | JSONB | Array of detected anomalies |
| `recommendations` | JSONB | Array of recommendation strings |
| `calculated_at` | TIMESTAMPTZ | DEFAULT NOW() |

#### `audit_logs`

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID | FK → users.id |
| `action` | VARCHAR(100) | NOT NULL (e.g., 'create_inspection', 'update_compliance_status') |
| `entity_type` | VARCHAR(50) | NOT NULL |
| `entity_id` | UUID | |
| `old_values` | JSONB | Previous state |
| `new_values` | JSONB | New state |
| `ip_address` | VARCHAR(45) | |
| `user_agent` | TEXT | |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |

### 4.3 Indexes

```sql
CREATE INDEX idx_compliance_mine_status ON compliance(mine_id, status);
CREATE INDEX idx_compliance_due_date ON compliance(due_date);
CREATE INDEX idx_inspections_mine_date ON inspections(mine_id, date DESC);
CREATE INDEX idx_observations_severity ON observations(severity);
CREATE INDEX idx_observations_status ON observations(status);
CREATE INDEX idx_corrective_actions_status_deadline ON corrective_actions(status, deadline);
CREATE INDEX idx_alerts_mine_unresolved ON alerts(mine_id) WHERE is_resolved = FALSE;
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_risk_scores_mine ON risk_scores(mine_id, calculated_at DESC);
CREATE INDEX idx_documents_ocr_status ON documents(ocr_status);
```

---

## 5. Authentication & Authorization

### 5.1 Auth Flow

1. Frontend authenticates via Supabase Auth SDK → receives JWT.
2. Frontend sends JWT in `Authorization: Bearer <token>` header.
3. Backend middleware verifies JWT with Supabase public key.
4. Backend extracts `supabase_uid` from JWT, looks up internal `users` table to get role and mine assignments.
5. Role and mine scope injected into request context.

### 5.2 Middleware

```python
# Pseudocode
@app.middleware("http")
async def auth_middleware(request, call_next):
    token = extract_bearer_token(request)
    payload = verify_supabase_jwt(token)
    user = await get_user_by_supabase_uid(payload["sub"])
    request.state.user = user
    request.state.mine_ids = await get_user_mine_ids(user.id)
    return await call_next(request)
```

### 5.3 Authorization Decorator

```python
def require_role(*roles):
    def decorator(func):
        async def wrapper(request, *args, **kwargs):
            if request.state.user.role not in roles:
                raise HTTPException(403, "Insufficient permissions")
            return await func(request, *args, **kwargs)
        return wrapper
    return decorator
```

### 5.4 Mine Scoping

Non-admin, non-corporate users only see data for mines they are assigned to. Every query filters by `mine_id IN (user's assigned mines)`.

---

## 6. API Endpoints

### 6.1 Auth

| Method | Path | Roles | Description |
|---|---|---|---|
| `GET` | `/api/auth/me` | All | Return current user profile + role + assigned mines |
| `PUT` | `/api/auth/me` | All | Update own profile (name, phone) |

### 6.2 Users (Admin)

| Method | Path | Roles | Description |
|---|---|---|---|
| `GET` | `/api/users` | admin | List all users, filter by role/mine/status |
| `POST` | `/api/users` | admin | Create user (triggers Supabase Auth invite) |
| `GET` | `/api/users/:id` | admin | Get user detail |
| `PUT` | `/api/users/:id` | admin | Update user role, status, assignments |
| `DELETE` | `/api/users/:id` | admin | Deactivate user (soft delete) |
| `POST` | `/api/users/:id/assign-mine` | admin | Assign user to a mine |
| `DELETE` | `/api/users/:id/assign-mine/:mine_id` | admin | Remove mine assignment |

### 6.3 Mines

| Method | Path | Roles | Description |
|---|---|---|---|
| `GET` | `/api/mines` | All | List mines (scoped by user's assignments; admin/corporate see all) |
| `POST` | `/api/mines` | admin | Create mine |
| `GET` | `/api/mines/:id` | Assigned + admin/corp | Get mine detail with boundary GeoJSON |
| `PUT` | `/api/mines/:id` | admin | Update mine |
| `GET` | `/api/mines/:id/summary` | Assigned + admin/corp | KPI summary: compliance %, open observations, risk score |
| `GET` | `/api/mines/geojson` | All | All mines as GeoJSON FeatureCollection (for map) |

### 6.4 Compliance

| Method | Path | Roles | Description |
|---|---|---|---|
| `GET` | `/api/compliance` | By mine scope | List compliance items. Query: `mine_id`, `status`, `category`, `due_before`, `due_after`, `risk_level` |
| `POST` | `/api/compliance` | admin, mine_official | Create compliance item |
| `GET` | `/api/compliance/:id` | By mine scope | Get compliance detail with history |
| `PUT` | `/api/compliance/:id` | admin, mine_official, assigned user | Update compliance (status, notes, document) |
| `GET` | `/api/compliance/:id/history` | By mine scope | Status change history (from audit log) |
| `GET` | `/api/compliance/stats` | By mine scope | Aggregated stats: total, completed, pending, overdue by mine |
| `GET` | `/api/compliance/overdue` | By mine scope | All overdue items |
| `GET` | `/api/compliance/upcoming` | By mine scope | Items due in next 7/14/30 days |

### 6.5 Inspections

| Method | Path | Roles | Description |
|---|---|---|---|
| `GET` | `/api/inspections` | By mine scope | List inspections. Query: `mine_id`, `inspector_id`, `type`, `status`, `date_from`, `date_to` |
| `POST` | `/api/inspections` | mine_official, inspector | Create inspection |
| `GET` | `/api/inspections/:id` | By mine scope | Get inspection with observations |
| `PUT` | `/api/inspections/:id` | Creator or admin | Update inspection |
| `POST` | `/api/inspections/:id/complete` | Creator | Mark inspection completed |
| `GET` | `/api/inspections/geojson` | By mine scope | Inspections as GeoJSON for map |

### 6.6 Observations

| Method | Path | Roles | Description |
|---|---|---|---|
| `GET` | `/api/observations` | By mine scope | List observations. Query: `inspection_id`, `severity`, `status`, `category` |
| `POST` | `/api/observations` | inspector, mine_official | Create observation (under an inspection) |
| `GET` | `/api/observations/:id` | By mine scope | Get observation with corrective actions |
| `PUT` | `/api/observations/:id` | Creator or admin | Update observation |
| `POST` | `/api/observations/:id/corrective-action` | mine_official | Assign corrective action |
| `GET` | `/api/observations/geojson` | By mine scope | Observations as GeoJSON for map |

### 6.7 Corrective Actions

| Method | Path | Roles | Description |
|---|---|---|---|
| `GET` | `/api/corrective-actions` | By mine scope | List. Query: `assigned_to`, `status`, `overdue` |
| `GET` | `/api/corrective-actions/:id` | By mine scope | Detail |
| `PUT` | `/api/corrective-actions/:id` | Assigned user | Update status, add completion notes/photo |
| `POST` | `/api/corrective-actions/:id/verify` | mine_official | Verify completion |

### 6.8 Contractors

| Method | Path | Roles | Description |
|---|---|---|---|
| `GET` | `/api/contractors` | By mine scope | List contractors. Query: `mine_id`, `compliance_status`, `expiring_before` |
| `POST` | `/api/contractors` | admin, mine_official | Create contractor |
| `GET` | `/api/contractors/:id` | By mine scope | Contractor detail |
| `PUT` | `/api/contractors/:id` | admin, mine_official | Update contractor |
| `GET` | `/api/contractors/expiring` | By mine scope | Contracts expiring in next 30 days |

### 6.9 Alerts

| Method | Path | Roles | Description |
|---|---|---|---|
| `GET` | `/api/alerts` | By mine scope | List alerts. Query: `mine_id`, `type`, `severity`, `is_read`, `is_resolved` |
| `GET` | `/api/alerts/unread-count` | By mine scope | Count of unread alerts |
| `PUT` | `/api/alerts/:id/read` | All | Mark alert as read |
| `PUT` | `/api/alerts/:id/resolve` | mine_official, admin | Mark alert as resolved |

### 6.10 Documents & OCR

| Method | Path | Roles | Description |
|---|---|---|---|
| `GET` | `/api/documents` | By mine scope | List documents. Query: `mine_id`, `ocr_status`, `linked` |
| `POST` | `/api/documents/upload` | mine_official, inspector | Upload document (multipart). Triggers OCR background task |
| `GET` | `/api/documents/:id` | By mine scope | Document detail with OCR results |
| `PUT` | `/api/documents/:id` | mine_official | Update OCR-extracted fields (manual correction) |
| `POST` | `/api/documents/:id/link` | mine_official | Link document to a compliance record |
| `POST` | `/api/documents/:id/reprocess` | admin | Re-trigger OCR |

### 6.11 Risk & AI

| Method | Path | Roles | Description |
|---|---|---|---|
| `GET` | `/api/risk/score` | By mine scope | Latest risk score for a mine. Query: `mine_id` |
| `GET` | `/api/risk/history` | By mine scope | Risk score history (for trend charts). Query: `mine_id`, `days=30` |
| `GET` | `/api/risk/anomalies` | By mine scope | List of AI-detected anomalies. Query: `mine_id`, `severity` |
| `POST` | `/api/risk/recalculate` | admin | Trigger risk recalculation for a mine |
| `GET` | `/api/risk/corporate-summary` | corporate, admin | All mines risk ranking |

### 6.12 Reports

| Method | Path | Roles | Description |
|---|---|---|---|
| `GET` | `/api/reports/compliance` | mine_official, corporate, regulatory | Compliance report. Query: `mine_id`, `from`, `to`, `format=json|pdf` |
| `GET` | `/api/reports/safety` | mine_official, corporate, regulatory | Safety/inspection report |
| `GET` | `/api/reports/contractor` | mine_official, corporate | Contractor compliance report |
| `GET` | `/api/reports/executive-summary` | corporate, admin | Multi-mine executive summary |

### 6.13 Audit Log

| Method | Path | Roles | Description |
|---|---|---|---|
| `GET` | `/api/audit-log` | admin, regulatory | Query: `user_id`, `entity_type`, `entity_id`, `action`, `from`, `to`. Paginated |

### 6.14 AI Assistant (Optional)

| Method | Path | Roles | Description |
|---|---|---|---|
| `POST` | `/api/assistant/query` | All | Natural language query. Body: `{"question": "..."}`. Returns structured answer from authorized data only |

### 6.15 Sync (Offline Support)

| Method | Path | Roles | Description |
|---|---|---|---|
| `POST` | `/api/sync/batch` | inspector | Accept batch of offline-created inspections/observations. Body: array of entities with client-generated UUIDs and timestamps. Server deduplicates by client UUID. Returns sync result with any conflicts |

---

## 7. API Standards

### 7.1 Request/Response Format

All responses follow:

```json
{
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "per_page": 20,
    "total_pages": 5
  }
}
```

Error responses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "due_date is required",
    "details": [
      {"field": "due_date", "message": "This field is required"}
    ]
  }
}
```

### 7.2 Pagination

All list endpoints support `?page=1&per_page=20`. Default page size: 20. Maximum: 100.

### 7.3 Filtering

Filters passed as query parameters. Date ranges: `from` / `to` in ISO 8601. Enums: exact match. Text: `search` parameter for full-text search.

### 7.4 Sorting

`?sort=created_at&order=desc`. Default: `created_at DESC`.

### 7.5 Rate Limiting

- 100 requests/minute per user for read endpoints.
- 30 requests/minute per user for write endpoints.
- 5 requests/minute for `/api/risk/recalculate`.
- 10 requests/minute for `/api/documents/upload`.

---

## 8. AI / ML Risk Engine

### 8.1 Risk Score Calculation

The risk engine runs as a background job, triggered:
- On-demand via `POST /api/risk/recalculate`
- Automatically every 6 hours via scheduled task
- Automatically when a high/critical observation is created

**Input Features:**

| Feature | Source | Weight |
|---|---|---|
| Overdue compliance ratio | compliance table: overdue / total | 25% |
| Open high/critical observations | observations table | 25% |
| Corrective action overdue ratio | corrective_actions: overdue / total | 15% |
| Inspection frequency deficit | inspections: actual vs expected frequency | 10% |
| Historical violation count (90 days) | observations where severity >= high | 10% |
| Contractor non-compliance rate | contractors: non_compliant / total | 10% |
| Environmental compliance rate | compliance where category = environmental | 5% |

**Score Calculation:**

```python
overall_score = (
    compliance_risk * 0.25 +
    safety_risk * 0.25 +
    corrective_action_risk * 0.15 +
    inspection_risk * 0.10 +
    historical_risk * 0.10 +
    contractor_risk * 0.10 +
    environmental_risk * 0.05
) * 100

risk_level = (
    "low" if overall_score < 25
    else "medium" if overall_score < 50
    else "high" if overall_score < 75
    else "critical"
)
```

### 8.2 Anomaly Detection

Uses Isolation Forest (scikit-learn) on historical time-series data:

**Monitored metrics per mine (weekly aggregated):**
- Number of new observations
- Number of overdue compliance items
- Inspection frequency
- Corrective action closure rate
- Contractor compliance changes

When a new weekly data point is classified as anomaly (contamination threshold=0.1), an AI alert is generated.

### 8.3 Pattern Detection

Periodic batch job (daily) that identifies:
- Compliance items overdue more than 3 times in the last year → "Repeated non-compliance" alert
- Same observation category appearing > 5 times in 90 days at same mine → "Recurring issue" alert
- Contractor with > 3 non-compliance flags in 6 months → "Contractor risk" alert

Results stored in `risk_scores.anomalies` and surfaced via alerts.

---

## 9. OCR Pipeline

### 9.1 Flow

```
Upload file → Store in Supabase Storage
           → Create documents record (ocr_status = 'pending')
           → Trigger background task

Background task:
  1. Download file from Storage
  2. If PDF → convert pages to images (pdf2image)
  3. Run Tesseract OCR on each image
  4. Concatenate extracted text
  5. Run field extraction (regex + heuristic rules)
       → Extract: document_type, mine_name, authority, valid_until, issue_date
  6. Update documents record:
       ocr_extracted_text = full text
       ocr_extracted_fields = {structured fields}
       ocr_status = 'completed' (or 'failed')
```

### 9.2 Field Extraction Rules

```python
EXTRACTION_PATTERNS = {
    "valid_until": [
        r"valid\s*(until|till|upto|up to)\s*:?\s*(\d{1,2}[\s/-]\w+[\s/-]\d{4})",
        r"expiry\s*date\s*:?\s*(\d{1,2}[\s/-]\w+[\s/-]\d{4})",
    ],
    "authority": [
        r"issued\s*by\s*:?\s*(.+?)(?:\n|$)",
        r"authority\s*:?\s*(.+?)(?:\n|$)",
    ],
    "mine_name": [
        r"mine\s*(?:name)?\s*:?\s*(.+?)(?:\n|$)",
    ],
}
```

### 9.3 Error Handling

- If Tesseract fails: retry once, then mark `ocr_status = 'failed'`
- If file is corrupt/unreadable: mark failed with error message in `ocr_extracted_fields.error`
- Admin can trigger reprocessing via `POST /api/documents/:id/reprocess`

---

## 10. Alert Engine

### 10.1 Alert Generation

The alert engine runs as a scheduled background task every 15 minutes and on specific triggers.

**Scheduled checks:**

| Check | Condition | Alert Type | Severity |
|---|---|---|---|
| Compliance due soon | `due_date` in next 7 days AND status != completed | `compliance_due` | warning |
| Compliance overdue | `due_date` < today AND status != completed | `compliance_overdue` | critical |
| Corrective action overdue | `deadline` < today AND status not in (completed, verified) | `corrective_action_overdue` | critical |
| Contract expiring | `contract_end` in next 30 days | `contract_expiring` | warning |
| Inspection pending | Mine has no inspection in last 30 days | `inspection_pending` | warning |

**Event-driven triggers:**
- High/critical observation created → `high_risk_observation` alert
- AI anomaly detected → `ai_anomaly` alert

### 10.2 Escalation

Alerts auto-escalate if unresolved:
- Level 0 (created): visible to field/mine officials
- Level 1 (48 hours unresolved): escalate to mine manager
- Level 2 (96 hours unresolved): escalate to corporate management

Escalation updates `escalation_level` and creates a new alert for the higher-level audience.

### 10.3 Deduplication

Before creating an alert, check if an identical unresolved alert exists (same type, same `related_entity_id`). If so, skip creation.

---

## 11. GIS Services

### 11.1 GeoJSON Endpoints

All location-aware entities expose a `/geojson` endpoint returning standard GeoJSON `FeatureCollection`:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [longitude, latitude]
      },
      "properties": {
        "id": "uuid",
        "type": "observation",
        "severity": "high",
        "title": "Structural crack in pit wall",
        "date": "2026-09-15"
      }
    }
  ]
}
```

### 11.2 Spatial Queries (PostGIS)

- Mine boundary containment: check if observation GPS falls within mine boundary polygon
- Proximity queries: find observations within X meters of a point
- Risk heatmap data: aggregated observation density by grid cell

---

## 12. File Storage

### 12.1 Supabase Storage Buckets

| Bucket | Purpose | Max File Size | Allowed Types |
|---|---|---|---|
| `inspection-photos` | Observation/inspection photos | 10 MB | jpg, jpeg, png, webp |
| `compliance-documents` | Compliance certificates, reports | 20 MB | pdf, jpg, png |
| `corrective-action-evidence` | Completion evidence photos | 10 MB | jpg, jpeg, png, webp |
| `contractor-documents` | Contractor certificates | 20 MB | pdf, jpg, png |

### 12.2 Upload Flow

1. Frontend requests a signed upload URL from backend.
2. Frontend uploads directly to Supabase Storage.
3. Frontend sends the file URL to the backend API to associate with the entity.

---

## 13. Audit Logging

Every state-changing API operation creates an audit log entry automatically via a service-layer decorator:

```python
@audit_log(action="update_compliance_status", entity_type="compliance")
async def update_compliance(compliance_id, data, user):
    old = await get_compliance(compliance_id)
    updated = await save_compliance(compliance_id, data)
    return updated  # decorator captures old/new values
```

Audit logs are append-only and never deleted.

---

## 14. Background Tasks

### 14.1 MVP (FastAPI BackgroundTasks)

| Task | Trigger | Description |
|---|---|---|
| OCR processing | Document upload | Extract text from uploaded document |
| Risk recalculation | API call / schedule | Recalculate risk score for a mine |
| Alert generation | Schedule (15 min) / event | Check conditions and generate alerts |
| Alert escalation | Schedule (hourly) | Escalate unresolved alerts |
| Anomaly detection | Schedule (daily) | Run Isolation Forest on weekly metrics |
| Pattern detection | Schedule (daily) | Scan for repeated violations/issues |

### 14.2 Post-MVP (Celery + Redis)

Migrate background tasks to Celery for reliability, retry logic, and monitoring.

---

## 15. Error Handling

### 15.1 HTTP Status Codes

| Code | Usage |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Validation error, bad request |
| 401 | Missing or invalid JWT |
| 403 | Insufficient role/permissions |
| 404 | Entity not found |
| 409 | Conflict (duplicate, sync conflict) |
| 422 | Unprocessable entity (Pydantic validation) |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error |

### 15.2 Logging

- Structured JSON logging (structlog)
- Log levels: DEBUG (dev), INFO (requests), WARNING (rate limits), ERROR (exceptions)
- Request ID in every log line (middleware-generated UUID)
- Sensitive data (passwords, tokens) never logged

---

## 16. Security

### 16.1 Input Validation

All request bodies validated via Pydantic models with:
- Type enforcement
- String length limits
- Enum validation
- SQL injection prevention (parameterized queries via SQLAlchemy)
- File type validation (magic bytes, not just extension)

### 16.2 CORS

Allow only specific frontend origins:
```python
origins = [
    "https://coalguard.vercel.app",
    "http://localhost:5173",  # dev
]
```

### 16.3 Headers

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security: max-age=31536000`

### 16.4 Data Protection

- Passwords handled entirely by Supabase Auth (never stored in app DB)
- File uploads scanned for type validity
- GPS coordinates rounded to 5 decimal places for storage (not for display)
- PII fields (email, phone) accessible only to admin and the user themselves

---

## 17. Testing Strategy

| Layer | Tool | Coverage Target |
|---|---|---|
| Unit tests | Pytest | Service layer functions, risk calculation, OCR extraction — 80% |
| Integration tests | Pytest + httpx async client | All API endpoints with DB — 70% |
| Auth tests | Pytest | Role-based access for every endpoint — 100% of role combinations |
| AI/ML tests | Pytest | Risk score calculation with known inputs — 90% |
| OCR tests | Pytest | Field extraction with sample documents — per-pattern |
| Load tests | Locust (post-MVP) | 100 concurrent users, < 500ms p95 |

---

## 18. Deployment

### 18.1 Environment Variables

```
DATABASE_URL=postgresql+asyncpg://...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
SUPABASE_JWT_SECRET=...
TESSERACT_PATH=/usr/bin/tesseract
ENVIRONMENT=production
LOG_LEVEL=INFO
CORS_ORIGINS=https://coalguard.vercel.app
```

### 18.2 Docker

```dockerfile
FROM python:3.11-slim
RUN apt-get update && apt-get install -y tesseract-ocr poppler-utils
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 18.3 CI/CD (GitHub Actions)

```
on push to main:
  1. Lint (ruff)
  2. Type check (mypy)
  3. Test (pytest)
  4. Build Docker image
  5. Deploy to Render/Railway
```

---

## 19. Folder Structure

```
backend/
├── app/
│   ├── main.py                  # FastAPI app, middleware, startup
│   ├── config.py                # Settings from env vars (pydantic-settings)
│   ├── database.py              # SQLAlchemy async engine + session
│   ├── dependencies.py          # Common dependencies (get_db, get_current_user)
│   ├── middleware/
│   │   ├── auth.py              # JWT verification middleware
│   │   ├── audit.py             # Audit log middleware/decorator
│   │   └── rate_limit.py        # Rate limiting
│   ├── models/                  # SQLAlchemy ORM models
│   │   ├── user.py
│   │   ├── mine.py
│   │   ├── compliance.py
│   │   ├── inspection.py
│   │   ├── observation.py
│   │   ├── corrective_action.py
│   │   ├── contractor.py
│   │   ├── alert.py
│   │   ├── document.py
│   │   ├── risk_score.py
│   │   └── audit_log.py
│   ├── schemas/                 # Pydantic request/response schemas
│   │   ├── user.py
│   │   ├── mine.py
│   │   ├── compliance.py
│   │   ├── inspection.py
│   │   ├── observation.py
│   │   ├── corrective_action.py
│   │   ├── contractor.py
│   │   ├── alert.py
│   │   ├── document.py
│   │   ├── risk.py
│   │   └── common.py            # Pagination, error response
│   ├── routers/                 # FastAPI routers
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── mines.py
│   │   ├── compliance.py
│   │   ├── inspections.py
│   │   ├── observations.py
│   │   ├── corrective_actions.py
│   │   ├── contractors.py
│   │   ├── alerts.py
│   │   ├── documents.py
│   │   ├── risk.py
│   │   ├── reports.py
│   │   ├── audit_log.py
│   │   ├── assistant.py
│   │   └── sync.py
│   ├── services/                # Business logic
│   │   ├── compliance_service.py
│   │   ├── inspection_service.py
│   │   ├── risk_engine.py
│   │   ├── ocr_service.py
│   │   ├── alert_service.py
│   │   ├── audit_service.py
│   │   ├── gis_service.py
│   │   ├── report_service.py
│   │   └── sync_service.py
│   └── tasks/                   # Background tasks
│       ├── ocr_task.py
│       ├── risk_task.py
│       ├── alert_task.py
│       └── anomaly_task.py
├── migrations/                  # Alembic migrations
│   ├── env.py
│   └── versions/
├── tests/
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_compliance.py
│   ├── test_inspections.py
│   ├── test_risk_engine.py
│   ├── test_ocr.py
│   └── test_alerts.py
├── sample_data/                 # Seed data for demo/hackathon
│   ├── mines.json
│   ├── compliance.json
│   ├── inspections.json
│   └── users.json
├── alembic.ini
├── requirements.txt
├── Dockerfile
├── .env.example
└── README.md
```

---

## 20. MVP Scope (Hackathon)

| Priority | Feature | Endpoints |
|---|---|---|
| P0 | Auth middleware + user profile | `/api/auth/me` |
| P0 | Mines CRUD + GeoJSON | `/api/mines/*` |
| P0 | Compliance CRUD + stats | `/api/compliance/*` |
| P0 | Inspections + Observations CRUD | `/api/inspections/*`, `/api/observations/*` |
| P0 | Corrective Actions | `/api/corrective-actions/*` |
| P0 | File upload (photos) | Supabase Storage integration |
| P1 | Risk score calculation | `/api/risk/score`, `/api/risk/recalculate` |
| P1 | Alert generation + listing | `/api/alerts/*` |
| P1 | Document upload + OCR | `/api/documents/*` |
| P1 | GeoJSON endpoints for map | All `/geojson` sub-routes |
| P2 | Anomaly detection | `/api/risk/anomalies` |
| P2 | Audit log | `/api/audit-log` |
| P2 | Offline sync | `/api/sync/batch` |
| P2 | Reports (PDF) | `/api/reports/*` |
| P3 | Contractor management | `/api/contractors/*` |
| P3 | AI assistant | `/api/assistant/query` |
| P3 | Alert escalation | Auto-escalation logic |

---

## 21. Sample Data Requirements

For the hackathon demo, seed the database with:

| Entity | Count | Notes |
|---|---|---|
| Users | 15 | 1 admin, 3 mine officials, 4 inspectors, 2 safety officers, 1 env officer, 2 corporate, 2 regulatory |
| Mines | 5 | Spread across 3 states, with real GPS coordinates |
| Compliance items | 120 | Mix of statuses: ~70 completed, ~20 pending, ~17 in progress, ~13 overdue |
| Inspections | 30 | Across 5 mines, last 90 days |
| Observations | 80 | Varying severity, linked to inspections |
| Corrective actions | 40 | Mix of statuses |
| Contractors | 10 | 2 per mine, some expiring soon |
| Alerts | 25 | Mix of types and severities |
| Risk scores | 5 | One per mine, pre-calculated |
| Documents | 5 | Sample compliance certificates for OCR demo |
