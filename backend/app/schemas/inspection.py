import datetime
from decimal import Decimal
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.inspection import InspectionStatus, InspectionType
from .common import PaginationMeta
from .observation import ObservationResponse


class InspectionBase(BaseModel):
    mine_id: UUID
    inspection_type: InspectionType
    date: datetime.date


class InspectionCreate(InspectionBase):
    inspector_id: UUID | None = None
    latitude: Decimal | None = None
    longitude: Decimal | None = None
    checklist_data: dict[str, Any] | None = None
    summary: str | None = None


class InspectionUpdate(BaseModel):
    inspection_type: InspectionType | None = None
    date: datetime.date | None = None
    latitude: Decimal | None = None
    longitude: Decimal | None = None
    checklist_data: dict[str, Any] | None = None
    summary: str | None = None
    status: InspectionStatus | None = None


class InspectionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    mine_id: UUID
    inspector_id: UUID
    inspection_type: InspectionType
    date: datetime.date
    latitude: Decimal | None = None
    longitude: Decimal | None = None
    checklist_data: dict[str, Any] | None = None
    summary: str | None = None
    status: InspectionStatus
    created_at: datetime.datetime
    updated_at: datetime.datetime
    observations: list[ObservationResponse] = []


class InspectionListResponse(BaseModel):
    data: list[InspectionResponse]
    meta: PaginationMeta
