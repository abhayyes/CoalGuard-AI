from __future__ import annotations
from typing import List, Dict, Any, Optional
from typing import Optional
from app.models.user import User, UserRole
from app.models.mine import Mine, MineType
from app.models.mine_assignment import MineAssignment
from app.models.compliance import (
    Compliance,
    ComplianceCategory,
    ComplianceStatus,
    RiskLevel,
)
from app.models.inspection import (
    Inspection,
    InspectionType,
    InspectionStatus,
)
from app.models.observation import (
    Observation,
    ObservationSeverity,
    ObservationCategory,
    ObservationStatus,
)
from app.models.corrective_action import (
    CorrectiveAction,
    CorrectiveActionStatus,
)
from app.models.contractor import (
    Contractor,
    ContractorComplianceStatus,
)
from app.models.alert import (
    Alert,
    AlertType,
    AlertSeverity,
)
from app.models.document import (
    Document,
    OCRStatus,
)
from app.models.risk_score import RiskScore
from app.models.audit_log import AuditLog

__all__ = [
    "User",
    "UserRole",
    "Mine",
    "MineType",
    "MineAssignment",
    "Compliance",
    "ComplianceCategory",
    "ComplianceStatus",
    "RiskLevel",
    "Inspection",
    "InspectionType",
    "InspectionStatus",
    "Observation",
    "ObservationSeverity",
    "ObservationCategory",
    "ObservationStatus",
    "CorrectiveAction",
    "CorrectiveActionStatus",
    "Contractor",
    "ContractorComplianceStatus",
    "Alert",
    "AlertType",
    "AlertSeverity",
    "Document",
    "OCRStatus",
    "RiskScore",
    "AuditLog",
]
