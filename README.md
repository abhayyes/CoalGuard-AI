# CoalGuard AI 🛡️
### AI-Based Smart Governance & Compliance Monitoring System for Coal Mines

CoalGuard AI is an enterprise-grade statutory compliance and safety governance platform engineered specifically for coal mining operations under Indian regulatory bodies (DGMS, MoEFCC, State PCB, CIL). It replaces manual paper logbooks and fragmented spreadsheets with real-time risk index analytics, geo-tagged inspection logging with offline GPS capture, OCR extraction of statutory clearance documents, and automated compliance tracking.

---

## 🌟 Architecture & Core Stack

### 1. Backend + APIs (`/backend`)
- **Framework**: FastAPI (Python 3.11+) with async/await concurrency throughout.
- **ORM & Database**: SQLAlchemy 2.0 (Async) + `asyncpg` driver on Supabase PostgreSQL.
- **Data Validation**: Pydantic v2 schemas with strict typing and serialization wrappers.
- **Authentication & RBAC**: Supabase Auth JWT verification with fallback claims decoding + role-based dependency injection (`require_role`).
- **Data Models (12 Core Entities)**:
  - `users`: Role-based profiles (`admin`, `mine_official`, `safety_officer`, `env_officer`, `inspector`, `corporate`, `regulatory`, `contractor`).
  - `mines`: Mine leases with GPS coordinates, operational capacities, and PostGIS boundary GeoJSON.
  - `mine_assignments`: Mine-scoping junction for granular data isolation.
  - `compliance`: Statutory obligations registry with category, severity, status, and deadlines.
  - `inspections`: Statutory safety audits with JSONB checklists and geo-coordinates.
  - `observations`: Identified safety hazards and pit defects with photo attachments.
  - `corrective_actions`: Remediation workflows with SLA deadlines and verification logs.
  - `contractors`: Outsourced agency management, DGMS license validity, and safety scoring.
  - `alerts`: Automated statutory threshold escalation engine.
  - `documents`: Regulatory certificate repository with OCR text extraction.
  - `risk_scores`: AI-weighted hazard risk calculations.
  - `audit_logs`: Immutable compliance audit trail.

### 2. Frontend + Dashboards (`/frontend`)
- **Framework**: React 18 + TypeScript + Vite.
- **Styling**: Tailwind CSS with custom coal-governance color tokens (Navy `#1E3A5F`, Amber `#F59E0B`, Emerald `#10B981`).
- **State Management**: Zustand stores (`authStore` for session + `mineStore` for active mine selector).
- **Data Visualization**: Recharts for compliance breakdown donuts, monthly trends, and mine comparison bars.
- **Key Portals & Dashboards**:
  - **Mine Command Dashboard**: Real-time compliance score, overdue alarms, risk index, and quick inspection actions.
  - **Compliance Register**: Filterable statutory obligations tracker with status transitions.
  - **3-Step Inspection Wizard**: Multi-step safety audit form with auto-captured HTML5 GPS coordinates and DGMS checklists.
  - **Observations & Corrective Actions**: Defect tracking and resolution workflows.
  - **Contractor Agency Portal**: Manpower tracking, license expiry dates, and safety scores.
  - **Documents & OCR Vault**: Statutory clearance repository with OCR status badges.
  - **Corporate Command Center**: Multi-mine enterprise comparison, subsidiary ranking, and audit velocity metrics.
  - **Admin & RBAC Center**: Mining site registration, user onboarding, and access control.

### 3. Supabase + Database + Auth (`/backend/migrations`)
- PostGIS spatial extensions for boundary geofencing.
- Enum types for high-performance indexing (`user_role`, `mine_type`, `compliance_status`, `risk_level`, `inspection_status`, `observation_status`).
- SQL migration script: `backend/migrations/supabase_schema.sql`.
- Asynchronous seed script with demo mines, users, and audit records: `backend/sample_data/seed.py`.

---

## 🚀 Quickstart Guide

### Prerequisites
- Python 3.11+
- Node.js 18+
- Supabase project (PostgreSQL database + Auth)

---

### Backend Setup

```bash
cd backend

# 1. Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your Supabase DATABASE_URL and API keys

# 4. Seed sample test data (Optional)
python sample_data/seed.py

# 5. Start the FastAPI development server
uvicorn app.main:app --reload --port 8000
```
API Documentation will be live at `http://localhost:8000/docs`.

---

### Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env

# 3. Start Vite development server
npm run dev
```
Open `http://localhost:5173` to access the CoalGuard AI dashboard.

---

## 🔒 Security & RBAC Matrix

| Role | Mine Scope | Compliance Edit | Audit Inspection | Admin Config | Corporate Overview |
|---|---|---|---|---|---|
| `admin` | Global | Yes | Yes | Yes | Yes |
| `corporate` | Global | Read-only | Read-only | No | Yes |
| `mine_official` | Assigned | Yes | Yes | No | No |
| `safety_officer` | Assigned | Yes | Yes | No | No |
| `env_officer` | Assigned | Yes | Yes | No | No |
| `inspector` | Assigned | Read-only | Yes | No | No |
| `regulatory` | Global | Read-only | Read-only | No | Yes |
| `contractor` | Assigned | Restricted | No | No | No |

---

## 📄 License & Compliance
Engineered for compliance with the Mines Act 1952, Coal Mines Regulations (CMR 2017), and DGMS guidelines.
