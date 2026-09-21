from __future__ import annotations
from typing import Optional, List, Dict, Any, Union
from typing import List, Dict, Any, Optional, Union
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
    photo_urls: Optional[List[str]] = None
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None


class ObservationUpdate(BaseModel):
    description: Optional[str] = None
    severity: Optional[ObservationSeverity] = None
    category: Optional[ObservationCategory] = None
    photo_urls: Optional[List[str]] = None
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    status: Optional[ObservationStatus] = None


class ObservationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    inspection_id: UUID
    description: str
    severity: ObservationSeverity
    category: ObservationCategory
    photo_urls: Optional[List[str]] = None
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    status: ObservationStatus
    created_at: datetime
    updated_at: datetime
    corrective_actions: List[CorrectiveActionResponse] = []


class ObservationListResponse(BaseModel):
    data: List[ObservationResponse]
    meta: PaginationMeta
