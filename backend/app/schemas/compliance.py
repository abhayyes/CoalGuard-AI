"""Compliance schemas."""

from datetime import date, datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.compliance import (
    ComplianceCategory,
    ComplianceStatus,
    RiskLevel,
)
from .common import PaginationMeta


class ComplianceBase(BaseModel):
    mine_id: UUID
    requirement: str
    category: ComplianceCategory
    due_date: date


class ComplianceCreate(ComplianceBase):
    sub_category: str | None = None
    risk_level: RiskLevel | None = None
    responsible_user_id: UUID | None = None
    document_url: str | None = None


class ComplianceUpdate(BaseModel):
    requirement: str | None = None
    category: ComplianceCategory | None = None
    sub_category: str | None = None
    due_date: date | None = None
    responsible_user_id: UUID | None = None
    status: ComplianceStatus | None = None
    risk_level: RiskLevel | None = None
    document_url: str | None = None
    completion_date: date | None = None
    completion_notes: str | None = None


class ComplianceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    mine_id: UUID
    requirement: str
    category: ComplianceCategory
    sub_category: str | None = None
    due_date: date
    responsible_user_id: UUID | None = None
    status: ComplianceStatus
    risk_level: RiskLevel | None = None
    document_url: str | None = None
    completion_date: date | None = None
    completion_notes: str | None = None
    created_by: UUID | None = None
    created_at: datetime
    updated_at: datetime


class ComplianceListResponse(BaseModel):
    data: list[ComplianceResponse]
    meta: PaginationMeta


class ComplianceStatsResponse(BaseModel):
    total: int
    completed: int
    pending: int
    in_progress: int
    overdue: int
    compliance_rate: float
    by_category: dict[str, int]
