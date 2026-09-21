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
    contract_number: str | None = None
    scope_of_work: str | None = None
    worker_count: int = 0
    compliance_status: ContractorComplianceStatus = ContractorComplianceStatus.under_review
    documents: list[dict[str, Any]] | None = None
    training_records: list[dict[str, Any]] | None = None


class ContractorUpdate(BaseModel):
    name: str | None = None
    contract_number: str | None = None
    contract_start: date | None = None
    contract_end: date | None = None
    scope_of_work: str | None = None
    worker_count: int | None = None
    compliance_status: ContractorComplianceStatus | None = None
    documents: list[dict[str, Any]] | None = None
    training_records: list[dict[str, Any]] | None = None
    is_active: bool | None = None


class ContractorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    mine_id: UUID
    contract_number: str | None = None
    contract_start: date
    contract_end: date
    scope_of_work: str | None = None
    worker_count: int
    compliance_status: ContractorComplianceStatus
    documents: Any | None = None
    training_records: Any | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class ContractorListResponse(BaseModel):
    data: list[ContractorResponse]
    meta: PaginationMeta
