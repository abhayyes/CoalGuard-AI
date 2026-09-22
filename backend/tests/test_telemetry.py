import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from starlette.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_telemetry_zones():
    """Verify statutory monitoring zones are listed."""
    response = client.get("/api/telemetry/zones")
    assert response.status_code == 200
    zones = response.json()
    assert isinstance(zones, list)
    assert len(zones) >= 3
    assert "Working Face 4B (Longwall)" in zones


def test_get_latest_telemetry():
    """Verify instantaneous snapshot returns all required DGMS sensors with strict types."""
    response = client.get("/api/telemetry/latest?mine_id=test-mine-1")
    assert response.status_code == 200
    data = response.json()

    assert data["mine_id"] == "test-mine-1"
    assert "hazard_index" in data
    assert "sensors" in data
    sensors = data["sensors"]

    # Statutory safety parameters check
    assert "ch4" in sensors
    assert "co" in sensors
    assert "o2" in sensors
    assert "velocity" in sensors

    ch4 = sensors["ch4"]
    assert ch4["unit"] == "% vol"
    assert ch4["threshold_warning"] == 0.75
    assert ch4["threshold_critical"] == 1.25
    assert ch4["status"] in ["normal", "warning", "critical"]

    co = sensors["co"]
    assert co["unit"] == "ppm"
    assert co["threshold_warning"] == 25.0
    assert co["threshold_critical"] == 50.0


def test_get_telemetry_history():
    """Verify time-series history endpoint for charting."""
    response = client.get("/api/telemetry/history?mine_id=test-mine-1&limit=15")
    assert response.status_code == 200
    data = response.json()
    assert "points" in data
    assert len(data["points"]) == 15

    p0 = data["points"][0]
    assert "ch4_methane" in p0
    assert "co_carbon_monoxide" in p0
    assert "o2_oxygen" in p0
    assert "timestamp" in p0


def test_simulation_breach_and_reset():
    """Verify breach injection alters readings and can be cleanly reset."""
    # Reset first
    client.post("/api/telemetry/reset-simulation")

    # Inject breach
    spike_payload = {
        "sensor_type": "ch4_methane",
        "zone": "Working Face 4B (Longwall)",
        "spike_factor": 2.0
    }
    inj_res = client.post("/api/telemetry/simulate-breach", json=spike_payload)
    assert inj_res.status_code == 200
    inj_data = inj_res.json()
    assert inj_data["status"] == "success"

    # Query snapshot to confirm critical status
    snap_res = client.get("/api/telemetry/latest?zone=Working%20Face%204B%20(Longwall)")
    assert snap_res.status_code == 200
    snap = snap_res.json()
    assert snap["sensors"]["ch4"]["value"] >= 1.25
    assert snap["sensors"]["ch4"]["status"] == "critical"

    # Reset simulation
    reset_res = client.post("/api/telemetry/reset-simulation")
    assert reset_res.status_code == 200

    # Query again to confirm recovery
    snap_res_after = client.get("/api/telemetry/latest?zone=Working%20Face%204B%20(Longwall)")
    assert snap_res_after.status_code == 200
    snap_after = snap_res_after.json()
    assert snap_after["sensors"]["ch4"]["status"] in ["normal", "warning"]


def test_stream_telemetry_sse_headers():
    """Verify SSE streaming endpoint returns text/event-stream content type."""
    with client.stream("GET", "/api/telemetry/stream?mine_id=test-mine-1&max_events=2") as response:
        assert response.status_code == 200
        assert "text/event-stream" in response.headers.get("content-type", "")
        # Read the first event chunk
        for line in response.iter_lines():
            if line and ("telemetry_update" in line or "data:" in line or "id:" in line):
                break


def test_predict_endpoint():
    """Verify /predict returns dynamic safety and hazard risk prediction."""
    res = client.post("/predict", json={"ch4": 0.40, "co": 10.0})
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "predicted_risk_index" in data
    assert data["risk_tier"] == "Low Risk (Compliant)"

    # Test breach prediction
    res_breach = client.post("/predict", json={"ch4": 1.35, "co": 55.0})
    assert res_breach.status_code == 200
    data_breach = res_breach.json()
    assert data_breach["predicted_risk_index"] >= 75.0
    assert "Critical" in data_breach["risk_tier"]
    assert len(data_breach["statutory_breaches"]) >= 2
