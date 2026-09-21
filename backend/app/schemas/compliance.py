from __future__ import annotations
from typing import Optional, List, Dict, Any, Union
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
    sub_category: Optional[str] = None
    risk_level: Optional[RiskLevel] = None
    responsible_user_id: Optional[UUID] = None
    document_url: Optional[str] = None


class ComplianceUpdate(BaseModel):
    requirement: Optional[str] = None
    category: Optional[ComplianceCategory] = None
    sub_category: Optional[str] = None
    due_date: Optional[date] = None
    responsible_user_id: Optional[UUID] = None
    status: Optional[ComplianceStatus] = None
    risk_level: Optional[RiskLevel] = None
    document_url: Optional[str] = None
    completion_date: Optional[date] = None
    completion_notes: Optional[str] = None


class ComplianceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    mine_id: UUID
    requirement: str
    category: ComplianceCategory
    sub_category: Optional[str] = None
    due_date: date
    responsible_user_id: Optional[UUID] = None
    status: ComplianceStatus
    risk_level: Optional[RiskLevel] = None
    document_url: Optional[str] = None
    completion_date: Optional[date] = None
    completion_notes: Optional[str] = None
    created_by: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime


class ComplianceListResponse(BaseModel):
    data: List[ComplianceResponse]
    meta: PaginationMeta


class ComplianceStatsResponse(BaseModel):
    total: int
    completed: int
    pending: int
    in_progress: int
    overdue: int
    compliance_rate: float
    by_category: Dict[str, int]
