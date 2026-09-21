# CoalGuard AI — Frontend Product Requirements Document

**Version:** 1.0
**Date:** 20 September 2026
**Product:** CoalGuard AI — AI-Based Smart Governance and Compliance Monitoring System for Coal Mines
**Scope:** Web Dashboard + Responsive/PWA Field Application

---

## 1. Overview

The frontend is a React-based single-page application serving three distinct experiences:

1. **Web Dashboard** — used by mine officials, corporate management, and administrators on desktop/laptop browsers.
2. **Regulatory Portal** — a read-only, auditor-facing view of compliance records and inspection history.
3. **Field Application** — a mobile-first responsive/PWA interface used by inspectors in the field, with offline support.

All three share a single codebase with role-based routing and layout switching.

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Framework | React 18+ with Vite |
| Language | TypeScript |
| Routing | React Router v6 |
| State Management | Zustand (global) + React Query / TanStack Query (server state) |
| Styling | Tailwind CSS + shadcn/ui component primitives |
| Charts | Recharts |
| Maps / GIS | Leaflet.js + React-Leaflet with OpenStreetMap tiles |
| Forms | React Hook Form + Zod validation |
| Auth | Supabase Auth SDK (`@supabase/auth-helpers-react`) |
| Offline / PWA | Workbox (service worker), IndexedDB via Dexie.js |
| Testing | Vitest + React Testing Library |
| Deployment | Vercel |

---

## 3. Design System

### 3.1 Design Tokens

| Token | Value |
|---|---|
| Primary | `#1E3A5F` (deep navy) |
| Accent | `#F59E0B` (amber — safety/alert connotation) |
| Success | `#10B981` |
| Warning | `#F59E0B` |
| Danger | `#EF4444` |
| Critical | `#7C3AED` |
| Background | `#F8FAFC` (light), `#0F172A` (dark) |
| Surface | `#FFFFFF` (light), `#1E293B` (dark) |
| Border radius | `8px` (cards), `6px` (inputs), `4px` (badges) |
| Font | Inter (UI), JetBrains Mono (data/code) |

### 3.2 Component Library

Build on shadcn/ui primitives. Custom components required:

| Component | Purpose |
|---|---|
| `<StatCard>` | KPI tile: icon + value + label + trend indicator |
| `<RiskBadge>` | Color-coded pill: Low / Medium / High / Critical |
| `<ComplianceTimeline>` | Vertical timeline of compliance status changes |
| `<InspectionCard>` | Summary card with photo thumbnail, severity, GPS |
| `<AlertBanner>` | Sticky top banner for critical escalations |
| `<MapCluster>` | Leaflet marker cluster with risk-heatmap overlay |
| `<OfflineIndicator>` | Top bar indicator when operating offline |
| `<AuditLogTable>` | Sortable, filterable audit log with user avatars |
| `<FileDropzone>` | Drag-and-drop for document/photo upload with preview |
| `<AIInsightPanel>` | Collapsible side panel showing AI-generated risk insights |

### 3.3 Responsive Breakpoints

| Breakpoint | Target |
|---|---|
| `< 640px` | Mobile (field app primary) |
| `640–1024px` | Tablet |
| `> 1024px` | Desktop dashboard |

### 3.4 Dark Mode

Support system-preference-based dark mode toggle. All dashboards and the field app must render correctly in both themes.

---

## 4. Authentication & Authorization

### 4.1 Auth Flow

```
App Load → Supabase session check
  ├── No session → /login
  └── Session valid → fetch user profile → role-based redirect
        ├── admin       → /admin/dashboard
        ├── mine_official → /mine/dashboard
        ├── inspector    → /field/inspections
        ├── corporate    → /corporate/dashboard
        └── regulatory   → /regulatory/reports
```

### 4.2 Login Page

- Email + password login
- "Forgot password" link (Supabase magic link)
- Role displayed after login (non-selectable — assigned by admin)
- Session persisted in localStorage via Supabase SDK

### 4.3 Route Guards

Every route wrapped in `<ProtectedRoute allowedRoles={[...]}>`. Unauthorized access redirects to `/unauthorized` with a back-to-dashboard link.

---

## 5. Page Architecture & Routing

### 5.1 Shared Layout

```
<AppShell>
  <Sidebar />          <!-- collapsible, role-filtered nav -->
  <TopBar />           <!-- search, alerts bell, user menu, offline indicator -->
  <main>
    <Outlet />         <!-- page content -->
  </main>
</AppShell>
```

### 5.2 Route Map

#### Admin Routes (`/admin/*`)

| Route | Page | Description |
|---|---|---|
| `/admin/dashboard` | Admin Dashboard | System-wide stats, user counts, recent activity |
| `/admin/users` | User Management | CRUD users, assign roles, assign mines |
| `/admin/mines` | Mine Management | CRUD mines, set location/GPS, assign officials |
| `/admin/compliance-templates` | Compliance Templates | Create/edit compliance requirement templates |
| `/admin/workflows` | Workflow Config | Configure escalation hierarchies and alert rules |
| `/admin/audit-log` | Audit Log | Full system audit trail, filterable |

#### Mine Official Routes (`/mine/*`)

| Route | Page | Description |
|---|---|---|
| `/mine/dashboard` | Mine Dashboard | Compliance %, overdue, inspections, risk score, alerts |
| `/mine/compliance` | Compliance Register | Filterable table of all compliance items for this mine |
| `/mine/compliance/:id` | Compliance Detail | Single compliance item: status, history, documents, actions |
| `/mine/inspections` | Inspection List | All inspections, filter by date/status/inspector |
| `/mine/inspections/new` | Create Inspection | Multi-step form: checklist → observations → evidence → submit |
| `/mine/inspections/:id` | Inspection Detail | Observations, photos, GPS, corrective actions, timeline |
| `/mine/observations` | Observations | All observations across inspections, filterable |
| `/mine/observations/:id` | Observation Detail | Evidence, corrective action, assignment, deadline, status |
| `/mine/contractors` | Contractor List | Active contractors, compliance status, expiry alerts |
| `/mine/contractors/:id` | Contractor Detail | Contract info, workers, documents, safety record |
| `/mine/alerts` | Alerts | All alerts for this mine, mark read/resolved |
| `/mine/documents` | Document Manager | Upload, OCR status, linked compliance records |
| `/mine/risk` | AI Risk Dashboard | Risk score breakdown, anomaly list, trend charts |
| `/mine/map` | GIS Map | Mine map with observations, inspections, risk heatmap |

#### Corporate Routes (`/corporate/*`)

| Route | Page | Description |
|---|---|---|
| `/corporate/dashboard` | Corporate Dashboard | Multi-mine overview, aggregated KPIs |
| `/corporate/mines` | Mine Comparison | Side-by-side mine compliance/safety comparison |
| `/corporate/risk` | Risk Overview | All mines risk scores, highest-risk-first ranking |
| `/corporate/reports` | Report Generator | Date-range compliance/safety/contractor reports (PDF export) |
| `/corporate/map` | National GIS Map | All mines on map, risk heatmap, drill-down |

#### Field Inspector Routes (`/field/*`)

| Route | Page | Description |
|---|---|---|
| `/field/inspections` | My Inspections | Inspector's assigned/recent inspections |
| `/field/inspections/new` | New Inspection | Simplified mobile form with camera/GPS integration |
| `/field/inspections/:id` | Inspection Detail | View/edit observations, upload evidence |
| `/field/observations/new` | Quick Observation | Standalone observation capture (photo + GPS + note) |
| `/field/corrective-actions` | My Actions | Corrective actions assigned to this inspector |
| `/field/sync` | Sync Status | Show pending offline items, manual sync trigger |

#### Regulatory Routes (`/regulatory/*`)

| Route | Page | Description |
|---|---|---|
| `/regulatory/reports` | Compliance Reports | Read-only compliance records by mine, date, category |
| `/regulatory/inspections` | Inspection Records | Read-only inspection history with evidence |
| `/regulatory/audit` | Audit Trail | Read-only audit log for authorized scope |

---

## 6. Key Page Specifications

### 6.1 Mine Dashboard (`/mine/dashboard`)

**Layout:** 4-column grid on desktop, single-column stack on mobile.

**Sections:**

1. **KPI Row** — 4 StatCards:
   - Compliance Rate (% with trend arrow)
   - Overdue Compliance (count, danger color if > 0)
   - Open Observations (count by severity)
   - Risk Score (gauge: 0–100, color-coded)

2. **Compliance Status Chart** — Donut chart: Completed / Pending / Overdue / In Progress

3. **Recent Inspections** — Table: Date, Inspector, Type, Observations count, Status

4. **Critical Alerts** — List of unresolved critical/high alerts with timestamp and action link

5. **AI Insights Panel** — Collapsible right sidebar:
   - Top 3 risk factors
   - Anomaly highlights
   - "View full risk analysis" link

6. **Mini Map** — Small Leaflet map showing mine boundary + recent observation pins

**Data refresh:** TanStack Query polling every 60 seconds, with manual refresh button.

### 6.2 Inspection Creation (`/mine/inspections/new` and `/field/inspections/new`)

**Multi-step form wizard:**

| Step | Fields |
|---|---|
| Step 1: Basic Info | Mine (pre-filled or select), Inspection Type (dropdown), Date (auto-filled), Checklist template (select) |
| Step 2: Checklist | Dynamic checklist items (pass/fail/NA per item), notes per item |
| Step 3: Observations | Add 1+ observations: Description, Severity (Low/Medium/High/Critical), Photo(s) (camera or gallery), GPS (auto-capture with manual override), Corrective Action (text), Assigned To (user picker), Deadline (date picker) |
| Step 4: Review & Submit | Summary of all entries, edit links back to each step, Submit button |

**Field-specific behavior:**
- Camera opens natively via `<input type="file" capture="environment">`
- GPS auto-captured via Geolocation API with accuracy indicator
- All form data persisted to IndexedDB on each step change (offline resilience)
- On submit: if online → POST to API; if offline → queue in IndexedDB, show in `/field/sync`

### 6.3 GIS Map Page (`/mine/map` and `/corporate/map`)

**Features:**
- OpenStreetMap base layer
- Mine boundary polygon (from GeoJSON)
- Marker clusters for observations/inspections
- Color-coded markers by severity or by type (toggle)
- Risk heatmap overlay (toggle)
- Click marker → popup with: title, severity, date, photo thumbnail, "View detail" link
- Filter panel: date range, severity, type, inspector
- Corporate map: state → subsidiary → mine drill-down
- Legend panel

### 6.4 AI Risk Dashboard (`/mine/risk`)

**Sections:**

1. **Risk Score Gauge** — Circular gauge, 0–100, color gradient (green → red)
2. **Risk Factor Breakdown** — Horizontal stacked bar: Compliance Risk / Safety Risk / Environmental Risk / Historical / Operational
3. **Anomaly Feed** — Chronological list of AI-detected anomalies with severity badges
4. **Trend Charts** — Line charts: risk score over time (30/60/90 day), compliance rate trend, observation volume trend
5. **Recommendations** — AI-generated actionable suggestions (read-only cards)

### 6.5 Document Manager & OCR (`/mine/documents`)

**Upload flow:**
1. Drag-and-drop or click to browse (accept: PDF, JPG, PNG)
2. Upload → show progress bar
3. Backend processes OCR → frontend polls status (Processing / Completed / Failed)
4. On completion: display extracted fields in editable form
5. User reviews and confirms → link to compliance record
6. Document stored and searchable

**Document list:** Table with columns: File name, Upload date, OCR status, Linked compliance, Uploaded by.

---

## 7. State Management Architecture

### 7.1 Server State (TanStack Query)

All API data fetched/cached/synced via TanStack Query:

| Query Key | Endpoint | Stale Time |
|---|---|---|
| `['compliance', mineId]` | `GET /api/compliance?mine_id=X` | 60s |
| `['inspections', mineId]` | `GET /api/inspections?mine_id=X` | 60s |
| `['observations', inspectionId]` | `GET /api/observations?inspection_id=X` | 30s |
| `['alerts', mineId]` | `GET /api/alerts?mine_id=X` | 30s |
| `['risk-score', mineId]` | `GET /api/risk/score?mine_id=X` | 120s |
| `['contractors', mineId]` | `GET /api/contractors?mine_id=X` | 120s |
| `['audit-log']` | `GET /api/audit-log` | 60s |
| `['mines']` | `GET /api/mines` | 300s |
| `['users']` | `GET /api/users` | 300s |

### 7.2 Client State (Zustand)

| Store | State |
|---|---|
| `useAuthStore` | `user`, `role`, `mineId`, `logout()` |
| `useUIStore` | `sidebarOpen`, `darkMode`, `activeFilters`, `mapView` |
| `useOfflineStore` | `isOnline`, `pendingSync[]`, `lastSyncAt` |
| `useNotificationStore` | `unreadCount`, `notifications[]`, `markRead()` |

### 7.3 Offline State (Dexie.js / IndexedDB)

Tables mirroring critical API data for offline access:

| Table | Use |
|---|---|
| `offlineInspections` | Inspections created offline, pending sync |
| `offlineObservations` | Observations created offline |
| `offlinePhotos` | Photo blobs before upload |
| `cachedCompliance` | Last-fetched compliance data for offline viewing |
| `cachedMineData` | Mine details for offline map rendering |

Sync strategy: on connectivity restore, the service worker triggers background sync. Conflict resolution: server timestamp wins; user is notified of conflicts.

---

## 8. Offline / PWA Requirements

### 8.1 Service Worker (Workbox)

- **Pre-cache:** App shell (HTML, CSS, JS bundles), Leaflet tiles for assigned mine area
- **Runtime cache:** API responses (stale-while-revalidate for reads)
- **Background sync:** Queued POST/PUT requests replayed on connectivity restore

### 8.2 Install Prompt

Show a custom "Install CoalGuard" banner on mobile browsers after 2 visits. Manifest includes:
- `name: "CoalGuard AI"`
- `short_name: "CoalGuard"`
- `start_url: "/field/inspections"`
- `display: "standalone"`
- `theme_color: "#1E3A5F"`

### 8.3 Offline UX

- `<OfflineIndicator>` banner at top of screen when `navigator.onLine === false`
- All create-forms remain functional; data stored in IndexedDB
- Read views show cached data with "Last updated: ..." label
- `/field/sync` page shows queue of pending items with retry controls

---

## 9. Notification & Alert UX

### 9.1 In-App Notifications

- Bell icon in TopBar with unread count badge
- Dropdown panel: list of alerts, click to navigate to source entity
- Types: Compliance overdue, Corrective action assigned, AI anomaly, Contract expiry
- Mark individual or all-read

### 9.2 Browser Push Notifications

- Request permission on first login
- Critical alerts (High/Critical severity) trigger browser push when app is backgrounded
- Uses Supabase Realtime or web push via service worker

---

## 10. Accessibility & Internationalization

### 10.1 Accessibility (WCAG 2.1 AA)

- All interactive elements keyboard-navigable
- ARIA labels on icons, charts, map markers
- Color-coding always paired with text labels/icons (not color alone for severity)
- Focus management on modal open/close and page navigation
- Minimum contrast ratio 4.5:1

### 10.2 Internationalization (Future)

- All user-facing strings in a locale JSON file (`en.json`)
- Date/number formatting via `Intl` APIs
- RTL layout support deferred to v2
- Hindi language pack planned for v2

---

## 11. Performance Targets

| Metric | Target |
|---|---|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3s |
| Cumulative Layout Shift | < 0.1 |
| Bundle size (gzipped) | < 300 KB initial |
| Lighthouse score | > 90 (Performance, Accessibility) |

**Strategies:**
- Code-splitting per route (React.lazy + Suspense)
- Leaflet loaded only on map routes
- Recharts loaded only on dashboard/risk routes
- Image lazy loading for observation photos
- Virtualized lists for large tables (TanStack Virtual)

---

## 12. Error Handling & Edge Cases

| Scenario | Behavior |
|---|---|
| API 401 | Redirect to /login, clear session |
| API 403 | Show "Access denied" inline message |
| API 500 | Show toast: "Something went wrong. Retrying..." + auto-retry (3x) |
| Network offline | Show OfflineIndicator, degrade to cached data, queue writes |
| GPS unavailable | Show manual coordinate input with map pin selector |
| Camera denied | Fall back to file input (gallery) |
| OCR processing timeout | Show "Processing taking longer than expected" with manual retry |
| Large file upload (> 10 MB) | Client-side validation: "File too large. Maximum 10 MB." |
| Form validation | Inline field errors below each field, summary at top of form |
| Empty states | Illustrated empty-state components: "No inspections yet" with CTA |

---

## 13. Testing Strategy

| Layer | Tooling | Coverage Target |
|---|---|---|
| Unit tests | Vitest | Utility functions, Zustand stores, Zod schemas — 80% |
| Component tests | Vitest + React Testing Library | All custom components — 70% |
| Integration tests | Vitest + MSW (API mocking) | Key flows: login, create inspection, sync offline — 60% |
| E2E tests | Playwright | Golden path: login → dashboard → create inspection → view on map |
| Visual regression | Chromatic (optional) | Dashboard, map, forms |

---

## 14. Build & Deployment

| Concern | Approach |
|---|---|
| Build | Vite production build |
| CI | GitHub Actions: lint → typecheck → test → build → deploy |
| Hosting | Vercel (auto-deploy on push to `main`) |
| Preview | Vercel preview deployments on PRs |
| Environment variables | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE_URL` |
| Branch strategy | `main` (production), `develop` (integration), feature branches per member |

---

## 15. Folder Structure

```
frontend/
├── public/
│   ├── manifest.json
│   ├── sw.js
│   ├── icons/
│   └── tiles/                  # Pre-cached map tiles
├── src/
│   ├── app/
│   │   ├── routes/             # Route definitions
│   │   ├── layouts/            # AppShell, AuthLayout
│   │   └── providers/          # QueryProvider, AuthProvider, ThemeProvider
│   ├── components/
│   │   ├── ui/                 # shadcn/ui primitives
│   │   ├── dashboard/          # StatCard, KPIRow, ChartPanels
│   │   ├── inspection/         # InspectionCard, InspectionWizard
│   │   ├── compliance/         # ComplianceTimeline, ComplianceTable
│   │   ├── map/                # MapCluster, RiskHeatmap, MapFilters
│   │   ├── alerts/             # AlertBanner, AlertList
│   │   ├── documents/          # FileDropzone, OCRResultForm
│   │   └── shared/             # RiskBadge, OfflineIndicator, EmptyState
│   ├── hooks/                  # useGeolocation, useOnlineStatus, useCamera
│   ├── stores/                 # Zustand stores
│   ├── services/
│   │   ├── api.ts              # Axios/fetch wrapper
│   │   ├── supabase.ts         # Supabase client
│   │   └── offline.ts          # Dexie DB, sync logic
│   ├── lib/
│   │   ├── validation.ts       # Zod schemas
│   │   └── constants.ts        # Roles, severities, statuses
│   ├── types/                  # TypeScript interfaces
│   └── styles/
│       └── globals.css         # Tailwind base + custom tokens
├── tests/
├── .env.example
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 16. MVP Scope (Hackathon)

For the hackathon, implement the following subset in order of priority:

| Priority | Feature | Route(s) |
|---|---|---|
| P0 | Login + role-based redirect | `/login` |
| P0 | Mine Dashboard with KPI cards | `/mine/dashboard` |
| P0 | Compliance list + detail | `/mine/compliance`, `/mine/compliance/:id` |
| P0 | Create inspection with observation + photo + GPS | `/mine/inspections/new` |
| P0 | GIS Map with mine + observation pins | `/mine/map` |
| P1 | Alert list | `/mine/alerts` |
| P1 | AI Risk Dashboard (risk score + anomalies) | `/mine/risk` |
| P1 | Document upload + OCR result view | `/mine/documents` |
| P1 | Field inspector mobile inspection form | `/field/inspections/new` |
| P2 | Corporate multi-mine dashboard | `/corporate/dashboard` |
| P2 | Corporate GIS map | `/corporate/map` |
| P2 | Offline mode + sync | `/field/sync` |
| P2 | Audit log | `/admin/audit-log` |
| P3 | Contractor management | `/mine/contractors` |
| P3 | Report generation (PDF) | `/corporate/reports` |
| P3 | Regulatory read-only portal | `/regulatory/*` |

---

## 17. Dependencies on Backend

The frontend requires the backend to provide:

| Dependency | Detail |
|---|---|
| Auth | Supabase Auth — signup, login, session, role retrieval |
| REST API | All endpoints listed in Backend PRD, returning JSON |
| File storage | Supabase Storage buckets for photos and documents |
| OCR status | Polling endpoint or Supabase Realtime subscription for OCR job status |
| Risk score | `/api/risk/score` returning computed score + factors |
| GIS data | GeoJSON for mine boundaries; lat/lng on all geo-entities |
| Alerts | `/api/alerts` + Supabase Realtime channel for push |
| Audit log | `/api/audit-log` with pagination and filters |
