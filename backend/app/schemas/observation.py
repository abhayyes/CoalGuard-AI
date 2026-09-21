"""Observation schemas."""

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.observation import (
    ObservationCategory,
    ObservationSeverity,
    ObservationStatus,
)
from .common import PaginationMeta
from .corrective_action import CorrectiveActionResponse


class ObservationBase(BaseModel):
    inspection_id: UUID
    description: str
    severity: ObservationSeverity
    category: ObservationCategory = ObservationCategory.other


class ObservationCreate(ObservationBase):
    photo_urls: list[str] | None = None
    latitude: Decimal | None = None
    longitude: Decimal | None = None


class ObservationUpdate(BaseModel):
    description: str | None = None
    severity: ObservationSeverity | None = None
    category: ObservationCategory | None = None
    photo_urls: list[str] | None = None
    latitude: Decimal | None = None
    longitude: Decimal | None = None
    status: ObservationStatus | None = None


class ObservationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    inspection_id: UUID
    description: str
    severity: ObservationSeverity
    category: ObservationCategory
    photo_urls: list[str] | None = None
    latitude: Decimal | None = None
    longitude: Decimal | None = None
    status: ObservationStatus
    created_at: datetime
    updated_at: datetime
    corrective_actions: list[CorrectiveActionResponse] = []


class ObservationListResponse(BaseModel):
    data: list[ObservationResponse]
    meta: PaginationMeta
