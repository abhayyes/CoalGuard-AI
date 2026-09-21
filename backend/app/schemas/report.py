from __future__ import annotations
from typing import Optional, List, Dict, Any, Union
from typing import List, Dict, Any, Optional, Union
"""Report schemas."""

from datetime import date
from typing import Any
from uuid import UUID

from pydantic import BaseModel


class ComplianceReportItem(BaseModel):
    category: str
    total: int
    completed: int
    overdue: int
    pending: int
    compliance_rate: float


class ComplianceReportResponse(BaseModel):
    mine_id: Optional[UUID] = None
    mine_name: Optional[str] = None
    from_date: Optional[date] = None
    to_date: Optional[date] = None
    summary: Dict[str, Any]
    by_category: List[ComplianceReportItem]


class SafetyReportResponse(BaseModel):
    mine_id: Optional[UUID] = None
    total_inspections: int
    total_observations: int
    observations_by_severity: Dict[str, int]
    corrective_actions_total: int
    corrective_actions_resolved: int


class ContractorReportResponse(BaseModel):
    mine_id: Optional[UUID] = None
    total_contractors: int
    compliant_count: int
    non_compliant_count: int
    under_review_count: int
    total_workers: int


class ExecutiveSummaryResponse(BaseModel):
    total_mines: int
    overall_compliance_rate: float
    total_open_violations: int
    high_risk_mines_count: int
    mines_overview: List[Dict[str, Any]]
