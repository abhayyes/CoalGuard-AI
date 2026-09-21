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
    mine_id: UUID | None = None
    mine_name: str | None = None
    from_date: date | None = None
    to_date: date | None = None
    summary: dict[str, Any]
    by_category: list[ComplianceReportItem]


class SafetyReportResponse(BaseModel):
    mine_id: UUID | None = None
    total_inspections: int
    total_observations: int
    observations_by_severity: dict[str, int]
    corrective_actions_total: int
    corrective_actions_resolved: int


class ContractorReportResponse(BaseModel):
    mine_id: UUID | None = None
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
    mines_overview: list[dict[str, Any]]
