from __future__ import annotations
from typing import Optional, List, Dict, Any, Union
"""Contractor schemas."""

from datetime import date, datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.contractor import ContractorComplianceStatus
from .common import PaginationMeta


class ContractorBase(BaseModel):
    name: str
    mine_id: UUID
    contract_start: date
    contract_end: date


class ContractorCreate(ContractorBase):
    contract_number: Optional[str] = None
    scope_of_work: Optional[str] = None
    worker_count: int = 0
    compliance_status: ContractorComplianceStatus = ContractorComplianceStatus.under_review
    documents: List[Dict[str, Optional[Any]]] = None
    training_records: List[Dict[str, Optional[Any]]] = None


class ContractorUpdate(BaseModel):
    name: Optional[str] = None
    contract_number: Optional[str] = None
    contract_start: Optional[date] = None
    contract_end: Optional[date] = None
    scope_of_work: Optional[str] = None
    worker_count: Optional[int] = None
    compliance_status: Optional[ContractorComplianceStatus] = None
    documents: List[Dict[str, Optional[Any]]] = None
    training_records: List[Dict[str, Optional[Any]]] = None
    is_active: Optional[bool] = None


class ContractorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    mine_id: UUID
    contract_number: Optional[str] = None
    contract_start: date
    contract_end: date
    scope_of_work: Optional[str] = None
    worker_count: int
    compliance_status: ContractorComplianceStatus
    documents: Optional[Any] = None
    training_records: Optional[Any] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class ContractorListResponse(BaseModel):
    data: List[ContractorResponse]
    meta: PaginationMeta
