from __future__ import annotations

import asyncio
import json
import random
import time
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any

from fastapi import APIRouter, Query, Request, status
from fastapi.responses import StreamingResponse

from app.schemas.telemetry import (
    SensorType,
    SensorStatus,
    SensorReading,
    TelemetrySnapshot,
    TelemetryHistoryPoint,
    TelemetryHistoryResponse,
    SimulateBreachRequest,
)

router = APIRouter()

# Available mine monitoring zones
MINE_ZONES = [
    "Working Face 4B (Longwall)",
    "Return Airway North",
    "Main Incline Conveyor",
    "Pit 2 Highwall Slope",
    "Substation & Blower Fan 1",
]

# In-memory store for simulation overrides
# Format: {zone_sensor_key: {"target_value": float, "expires_at": float}}
_SIMULATION_OVERRIDES: Dict[str, Dict[str, Any]] = {}


def _get_sensor_definitions(zone: str) -> Dict[str, Dict[str, Any]]:
    """Statutory sensor definitions with DGMS Coal Mines Regulations 2017 thresholds."""
    return {
        "ch4": {
            "sensor_id": f"CH4-{zone[:3].upper()}-01",
            "name": "Methane Concentration (CH₄)",
            "type": SensorType.CH4_METHANE,
            "unit": "% vol",
            "base": 0.38,
            "noise": 0.04,
            "warning": 0.75,
            "critical": 1.25,
            "rule": "DGMS CMR 2017 Reg 169 (Max 0.75% in general body, 1.25% evacuation)",
        },
        "co": {
            "sensor_id": f"CO-{zone[:3].upper()}-02",
            "name": "Carbon Monoxide (CO)",
            "type": SensorType.CO_CARBON_MONOXIDE,
            "unit": "ppm",
            "base": 8.5,
            "noise": 1.5,
            "warning": 25.0,
            "critical": 50.0,
            "rule": "DGMS Tech Circular 4/2013 (Spontaneous heating early warning >25 ppm)",
        },
        "o2": {
            "sensor_id": f"O2-{zone[:3].upper()}-03",
            "name": "Oxygen Level (O₂)",
            "type": SensorType.O2_OXYGEN,
            "unit": "% vol",
            "base": 20.8,
            "noise": 0.1,
            "warning": 19.5,
            "critical": 19.0,
            "rule": "DGMS CMR 2017 Reg 153 (Minimum statutory standard 19.0% O₂)",
            "lower_is_worse": True,
        },
        "velocity": {
            "sensor_id": f"VEL-{zone[:3].upper()}-04",
            "name": "Ventilation Air Velocity",
            "type": SensorType.AIR_VELOCITY,
            "unit": "m/s",
            "base": 1.65,
            "noise": 0.2,
            "warning": 0.50,
            "critical": 0.30,
            "rule": "DGMS CMR 2017 Reg 154 (Minimum Face Airspeed >= 0.5 m/s)",
            "lower_is_worse": True,
        },
        "temp": {
            "sensor_id": f"TMP-{zone[:3].upper()}-05",
            "name": "Ambient Pit Temperature",
            "type": SensorType.AMBIENT_TEMP,
            "unit": "°C",
            "base": 29.2,
            "noise": 0.4,
            "warning": 33.5,
            "critical": 37.0,
            "rule": "DGMS Ergonomic & Wet Bulb Safety Limit (Max continuous working temp)",
        },
        "slope": {
            "sensor_id": f"SLP-{zone[:3].upper()}-06",
            "name": "Slope Displacement Rate",
            "type": SensorType.SLOPE_DISPLACEMENT,
            "unit": "mm/day",
            "base": 2.4,
            "noise": 0.5,
            "warning": 10.0,
            "critical": 25.0,
            "rule": "DGMS Highwall Slope Stability Guidelines (Radar prism alert >10mm/d)",
        },
        "vibration": {
            "sensor_id": f"VIB-{zone[:3].upper()}-07",
            "name": "Peak Particle Velocity (PPV)",
            "type": SensorType.GROUND_VIBRATION,
            "unit": "mm/s",
            "base": 0.55,
            "noise": 0.2,
            "warning": 5.0,
            "critical": 10.0,
            "rule": "DGMS Blasting Standard Cir 7/1997 (PPV structure threshold limit)",
        },
    }


def generate_snapshot(mine_id: str, zone: str) -> TelemetrySnapshot:
    """Generate dynamic telemetry readings including any simulated breaches."""
    defs = _get_sensor_definitions(zone)
    now = datetime.now(timezone.utc)
    current_ts = time.time()

    sensors: Dict[str, SensorReading] = {}
    hazard_scores: List[float] = []
    active_alarms = 0
    worst_status = SensorStatus.NORMAL

    for key, spec in defs.items():
        override_key = f"{zone}_{spec['type']}"
        val = spec["base"] + random.uniform(-spec["noise"], spec["noise"])

        # Check for simulated override
        if override_key in _SIMULATION_OVERRIDES:
            ov = _SIMULATION_OVERRIDES[override_key]
            if current_ts < ov["expires_at"]:
                val = ov["target_value"]
            else:
                del _SIMULATION_OVERRIDES[override_key]

        lower_is_worse = spec.get("lower_is_worse", False)
        status = SensorStatus.NORMAL

        if lower_is_worse:
            if val <= spec["critical"]:
                status = SensorStatus.CRITICAL
                active_alarms += 1
                hazard_scores.append(90.0)
            elif val <= spec["warning"]:
                status = SensorStatus.WARNING
                active_alarms += 1
                hazard_scores.append(65.0)
            else:
                hazard_scores.append(15.0)
        else:
            if val >= spec["critical"]:
                status = SensorStatus.CRITICAL
                active_alarms += 1
                hazard_scores.append(95.0)
            elif val >= spec["warning"]:
                status = SensorStatus.WARNING
                active_alarms += 1
                hazard_scores.append(60.0)
            else:
                hazard_scores.append(12.0)

        if status == SensorStatus.CRITICAL:
            worst_status = SensorStatus.CRITICAL
        elif status == SensorStatus.WARNING and worst_status != SensorStatus.CRITICAL:
            worst_status = SensorStatus.WARNING

        # Calculate small trend
        delta = random.choice(["rising", "falling", "stable"])

        sensors[key] = SensorReading(
            sensor_id=spec["sensor_id"],
            sensor_name=spec["name"],
            sensor_type=spec["type"],
            value=round(val, 2),
            unit=spec["unit"],
            status=status,
            zone=zone,
            timestamp=now,
            threshold_warning=spec["warning"],
            threshold_critical=spec["critical"],
            statutory_rule=spec["rule"],
            trend=delta,
        )

    composite_hazard = round(sum(hazard_scores) / max(len(hazard_scores), 1), 1)

    return TelemetrySnapshot(
        mine_id=mine_id,
        timestamp=now,
        active_zone=zone,
        hazard_index=composite_hazard,
        hazard_status=worst_status,
        sensors=sensors,
        available_zones=MINE_ZONES,
        active_alarms_count=active_alarms,
    )


@router.get("/zones")
async def get_telemetry_zones() -> List[str]:
    """Get list of active sensor monitoring zones in the mine."""
    return MINE_ZONES


@router.get("/latest", response_model=TelemetrySnapshot)
async def get_latest_telemetry(
    mine_id: str = Query("default", description="Mine UUID or identifier"),
    zone: Optional[str] = Query(None, description="Monitoring zone"),
) -> TelemetrySnapshot:
    """REST fallback endpoint returning instantaneous snapshot of all statutory sensors."""
    active_zone = zone if (zone and zone in MINE_ZONES) else MINE_ZONES[0]
    return generate_snapshot(mine_id=mine_id, zone=active_zone)


@router.get("/history", response_model=TelemetryHistoryResponse)
async def get_telemetry_history(
    mine_id: str = Query("default"),
    zone: Optional[str] = Query(None),
    limit: int = Query(20, ge=5, le=60),
) -> TelemetryHistoryResponse:
    """Historical time-series points for sparkline and trend charts."""
    active_zone = zone if (zone and zone in MINE_ZONES) else MINE_ZONES[0]
    now = datetime.now(timezone.utc)
    points: List[TelemetryHistoryPoint] = []

    for i in range(limit, 0, -1):
        ts = now - timedelta(seconds=i * 5)
        # Generate organic fluctuating curve
        wave = (i % 8) * 0.02
        points.append(
            TelemetryHistoryPoint(
                timestamp=ts,
                ch4_methane=round(0.35 + wave + random.uniform(-0.02, 0.02), 3),
                co_carbon_monoxide=round(8.0 + (i % 5) * 0.8 + random.uniform(-0.5, 0.5), 1),
                o2_oxygen=round(20.85 + random.uniform(-0.08, 0.08), 2),
                air_velocity=round(1.6 + random.uniform(-0.15, 0.15), 2),
                ambient_temp=round(29.0 + (i % 4) * 0.3 + random.uniform(-0.2, 0.2), 1),
                slope_displacement=round(2.1 + (limit - i) * 0.05 + random.uniform(-0.1, 0.1), 2),
            )
        )

    return TelemetryHistoryResponse(mine_id=mine_id, zone=active_zone, points=points)


@router.get("/stream")
async def stream_telemetry(
    request: Request,
    mine_id: str = Query("default"),
    zone: Optional[str] = Query(None),
    max_events: Optional[int] = Query(None, description="Optional cap on events for testing/sampling"),
):
    """
    High-resiliency Server-Sent Events (SSE) telemetry stream.
    Emits continuous sensor updates every 2 seconds with automatic keep-alive.
    """
    active_zone = zone if (zone and zone in MINE_ZONES) else MINE_ZONES[0]

    async def event_generator():
        seq = 0
        try:
            while True:
                # Disconnect check
                if await request.is_disconnected():
                    break

                seq += 1
                snapshot = generate_snapshot(mine_id=mine_id, zone=active_zone)
                data_json = snapshot.model_dump_json()

                # Yield standard SSE frame
                yield f"id: {seq}\nevent: telemetry_update\ndata: {data_json}\n\n"

                if max_events is not None and seq >= max_events:
                    break

                # Send keep-alive heartbeat comment every 5 cycles
                if seq % 5 == 0:
                    yield ": heartbeat\n\n"

                await asyncio.sleep(2.0)
        except asyncio.CancelledError:
            pass

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/simulate-breach")
async def simulate_statutory_breach(req: SimulateBreachRequest):
    """
    Test utility: Trigger an intentional statutory threshold breach on a sensor
    to verify resilient error states, alert banners, and visual escalation in UI.
    """
    defs = _get_sensor_definitions(req.zone)
    key_match = None
    for k, v in defs.items():
        if v["type"] == req.sensor_type:
            key_match = (k, v)
            break

    if not key_match:
        return {"status": "error", "message": f"Unknown sensor type {req.sensor_type}"}

    _, spec = key_match
    target_val = round(spec["critical"] * req.spike_factor, 2)
    if spec.get("lower_is_worse", False):
        target_val = round(spec["critical"] * (1.0 / req.spike_factor), 2)

    override_key = f"{req.zone}_{req.sensor_type}"
    _SIMULATION_OVERRIDES[override_key] = {
        "target_value": target_val,
        "expires_at": time.time() + 45.0,  # lasts 45 seconds
    }

    return {
        "status": "success",
        "message": f"Injected breach for {spec['name']} in {req.zone}: {target_val} {spec['unit']} (Statutory Critical: {spec['critical']})",
        "simulated_value": target_val,
        "duration_seconds": 45,
    }


@router.post("/reset-simulation")
async def reset_simulation():
    """Clear all active simulated breaches."""
    _SIMULATION_OVERRIDES.clear()
    return {"status": "success", "message": "All simulated breaches cleared."}
