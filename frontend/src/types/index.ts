export type UserRole =
  | 'admin'
  | 'mine_official'
  | 'safety_officer'
  | 'env_officer'
  | 'inspector'
  | 'corporate'
  | 'regulatory'
  | 'contractor';

export interface User {
  id: string;
  supabase_uid?: string;
  email: string;
  full_name: string;
  role: UserRole;
  department?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type MineType = 'opencast' | 'underground' | 'mixed';

export interface Mine {
  id: string;
  name: string;
  code?: string;
  subsidiary?: string;
  state: string;
  district?: string;
  location_description?: string;
  latitude: number;
  longitude: number;
  boundary_geojson?: any;
  mine_type?: MineType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MineSummary {
  mine_id: string;
  mine_name: string;
  compliance_rate: number;
  open_observations: number;
  risk_score: number;
  pending_actions: number;
}

export type ComplianceCategory =
  | 'statutory'
  | 'environmental'
  | 'safety'
  | 'operational'
  | 'labor'
  | 'financial';

export type ComplianceStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ComplianceItem {
  id: string;
  mine_id: string;
  requirement: string;
  category: ComplianceCategory;
  sub_category?: string;
  due_date: string;
  responsible_user_id?: string;
  status: ComplianceStatus;
  risk_level?: RiskLevel;
  document_url?: string;
  completion_date?: string;
  completion_notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ComplianceStats {
  total: number;
  completed: number;
  pending: number;
  in_progress: number;
  overdue: number;
  compliance_rate: number;
  by_category: Record<string, number>;
}

export type InspectionType = 'routine' | 'safety' | 'environmental' | 'special' | 'follow_up';
export type InspectionStatus = 'draft' | 'in_progress' | 'completed' | 'reviewed';

export interface Inspection {
  id: string;
  mine_id: string;
  inspector_id: string;
  inspection_type: InspectionType;
  date: string;
  latitude?: number;
  longitude?: number;
  checklist_data?: Record<string, any>;
  summary?: string;
  status: InspectionStatus;
  created_at: string;
  updated_at: string;
  observations?: Observation[];
}

export type ObservationSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ObservationCategory = 'safety' | 'environmental' | 'structural' | 'equipment' | 'procedural' | 'other';
export type ObservationStatus = 'open' | 'action_assigned' | 'in_progress' | 'resolved' | 'verified' | 'closed';

export interface Observation {
  id: string;
  inspection_id: string;
  description: string;
  severity: ObservationSeverity;
  category: ObservationCategory;
  photo_urls?: string[];
  latitude?: number;
  longitude?: number;
  status: ObservationStatus;
  created_at: string;
  updated_at: string;
  corrective_actions?: CorrectiveAction[];
}

export type CorrectiveActionStatus = 'assigned' | 'in_progress' | 'completed' | 'overdue' | 'verified';

export interface CorrectiveAction {
  id: string;
  observation_id: string;
  description: string;
  assigned_to: string;
  assigned_by: string;
  deadline: string;
  status: CorrectiveActionStatus;
  completion_notes?: string;
  completion_photo_url?: string;
  completed_at?: string;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export type ContractorComplianceStatus = 'compliant' | 'non_compliant' | 'partially_compliant' | 'under_review';

export interface Contractor {
  id: string;
  name: string;
  mine_id: string;
  contract_number?: string;
  contract_start: string;
  contract_end: string;
  scope_of_work?: string;
  worker_count: number;
  compliance_status: ContractorComplianceStatus;
  documents?: any;
  training_records?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  status?: string;
  company_name?: string;
  license_number?: string;
  valid_until?: string;
  workers_count?: number;
  safety_score?: number;
}

export type AlertType =
  | 'compliance_due'
  | 'compliance_overdue'
  | 'high_risk_observation'
  | 'contract_expiring'
  | 'corrective_action_overdue'
  | 'ai_anomaly'
  | 'inspection_pending';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface Alert {
  id: string;
  mine_id?: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  related_entity_type?: string;
  related_entity_id?: string;
  is_read: boolean;
  is_resolved: boolean;
  escalation_level: number;
  created_at: string;
  resolved_at?: string;
}

export type OCRStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface DocumentRecord {
  id: string;
  mine_id?: string;
  uploaded_by?: string;
  file_name: string;
  file_url: string;
  file_type?: string;
  file_size_bytes?: number;
  ocr_status: OCRStatus;
  ocr_extracted_text?: string;
  ocr_extracted_fields?: Record<string, any>;
  linked_compliance_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
