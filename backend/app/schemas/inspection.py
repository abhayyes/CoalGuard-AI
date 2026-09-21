from __future__ import annotations
from typing import Optional, List, Dict, Any, Union
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
    inspector_id: Optional[UUID] = None
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    checklist_data: Dict[str, Optional[Any]] = None
    summary: Optional[str] = None


class InspectionUpdate(BaseModel):
    inspection_type: Optional[InspectionType] = None
    date: Optional[datetime.date] = None
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    checklist_data: Dict[str, Optional[Any]] = None
    summary: Optional[str] = None
    status: Optional[InspectionStatus] = None


class InspectionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    mine_id: UUID
    inspector_id: UUID
    inspection_type: InspectionType
    date: datetime.date
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    checklist_data: Dict[str, Optional[Any]] = None
    summary: Optional[str] = None
    status: InspectionStatus
    created_at: datetime.datetime
    updated_at: datetime.datetime
    observations: List[ObservationResponse] = []


class InspectionListResponse(BaseModel):
    data: List[InspectionResponse]
    meta: PaginationMeta
