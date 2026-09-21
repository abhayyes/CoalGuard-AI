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
    code: str | None = None
    subsidiary: str | None = None
    district: str | None = None
    location_description: str | None = None
    boundary_geojson: dict[str, Any] | None = None
    mine_type: MineType | None = None


class MineUpdate(BaseModel):
    name: str | None = None
    code: str | None = None
    subsidiary: str | None = None
    state: str | None = None
    district: str | None = None
    location_description: str | None = None
    latitude: Decimal | None = None
    longitude: Decimal | None = None
    boundary_geojson: dict[str, Any] | None = None
    mine_type: MineType | None = None
    is_active: bool | None = None


class MineResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    code: str | None = None
    subsidiary: str | None = None
    state: str
    district: str | None = None
    location_description: str | None = None
    latitude: Decimal
    longitude: Decimal
    boundary_geojson: dict[str, Any] | None = None
    mine_type: MineType | None = None
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
    data: list[MineResponse]
    meta: PaginationMeta
