from __future__ import annotations

from enum import Enum
from typing import Dict, List, Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field


class SensorType(str, Enum):
    CH4_METHANE = "ch4_methane"
    CO_CARBON_MONOXIDE = "co_carbon_monoxide"
    O2_OXYGEN = "o2_oxygen"
    AIR_VELOCITY = "air_velocity"
    AMBIENT_TEMP = "ambient_temp"
    RELATIVE_HUMIDITY = "relative_humidity"
    SLOPE_DISPLACEMENT = "slope_displacement"
    GROUND_VIBRATION = "ground_vibration"


class SensorStatus(str, Enum):
    NORMAL = "normal"
    WARNING = "warning"
    CRITICAL = "critical"
    OFFLINE = "offline"


class SensorThresholds(BaseModel):
    warning: float
    critical: float
    unit: str
    statutory_reference: str


class SensorReading(BaseModel):
    sensor_id: str
    sensor_name: str
    sensor_type: SensorType
    value: float
    unit: str
    status: SensorStatus
    zone: str
    timestamp: datetime
    threshold_warning: float
    threshold_critical: float
    statutory_rule: str
    trend: str = "stable"  # "rising", "falling", "stable"


class TelemetrySnapshot(BaseModel):
    mine_id: str
    timestamp: datetime
    active_zone: str
    hazard_index: float  # 0 to 100 overall composite risk score
    hazard_status: SensorStatus
    sensors: Dict[str, SensorReading]
    available_zones: List[str]
    active_alarms_count: int


class TelemetryHistoryPoint(BaseModel):
    timestamp: datetime
    ch4_methane: float
    co_carbon_monoxide: float
    o2_oxygen: float
    air_velocity: float
    ambient_temp: float
    slope_displacement: float


class TelemetryHistoryResponse(BaseModel):
    mine_id: str
    zone: str
    points: List[TelemetryHistoryPoint]


class SimulateBreachRequest(BaseModel):
    sensor_type: SensorType = SensorType.CH4_METHANE
    zone: str = "Working Face 4B"
    spike_factor: float = Field(default=2.5, description="Multiplier over statutory threshold")
