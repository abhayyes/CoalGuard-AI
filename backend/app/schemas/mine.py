from __future__ import annotations
from typing import Optional, List, Dict, Any, Union
"""Mine schemas."""

from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from .common import PaginationMeta


class MineType(str, Enum):
    opencast = "opencast"
    underground = "underground"
    mixed = "mixed"


class MineBase(BaseModel):
    name: str
    state: str
    latitude: Decimal
    longitude: Decimal


class MineCreate(MineBase):
    code: Optional[str] = None
    subsidiary: Optional[str] = None
    district: Optional[str] = None
    location_description: Optional[str] = None
    boundary_geojson: Dict[str, Optional[Any]] = None
    mine_type: Optional[MineType] = None


class MineUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    subsidiary: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    location_description: Optional[str] = None
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    boundary_geojson: Dict[str, Optional[Any]] = None
    mine_type: Optional[MineType] = None
    is_active: Optional[bool] = None


class MineResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    code: Optional[str] = None
    subsidiary: Optional[str] = None
    state: str
    district: Optional[str] = None
    location_description: Optional[str] = None
    latitude: Decimal
    longitude: Decimal
    boundary_geojson: Dict[str, Optional[Any]] = None
    mine_type: Optional[MineType] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class MineSummaryResponse(BaseModel):
    mine_id: UUID
    mine_name: str
    compliance_rate: float
    open_observations: int
    risk_score: float
    pending_actions: int


class MineListResponse(BaseModel):
    data: List[MineResponse]
    meta: PaginationMeta
