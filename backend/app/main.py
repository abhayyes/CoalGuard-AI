from __future__ import annotations

from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from typing import Any
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base
from app.services.ai_client import ai_client
from app.routers import (
    auth,
    users,
    mines,
    compliance,
    inspections,
    observations,
    corrective_actions,
    contractors,
    alerts,
    documents,
    reports,
    audit_log,
    assistant,
    ai_proxy,
    telemetry,
)


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    """Create database tables on startup."""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        print(f'Database connection failed on startup: {e}')
    yield


app = FastAPI(
    title="CoalGuard AI",
    description="AI-Based Smart Governance and Compliance Monitoring System for Coal Mines",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(mines.router, prefix="/api/mines", tags=["Mines"])
app.include_router(compliance.router, prefix="/api/compliance", tags=["Compliance"])
app.include_router(inspections.router, prefix="/api/inspections", tags=["Inspections"])
app.include_router(observations.router, prefix="/api/observations", tags=["Observations"])
app.include_router(corrective_actions.router, prefix="/api/corrective-actions", tags=["Corrective Actions"])
app.include_router(contractors.router, prefix="/api/contractors", tags=["Contractors"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(audit_log.router, prefix="/api/audit-log", tags=["Audit Log"])
app.include_router(assistant.router, prefix="/api/assistant", tags=["Assistant"])
app.include_router(ai_proxy.router, prefix="/api/ai", tags=["AI Service"])
app.include_router(telemetry.router, prefix="/api/telemetry", tags=["Telemetry"])


@app.get("/api/health")
async def health_check() -> dict[str, str]:
    return {"status": "healthy", "service": "coalguard-ai"}


@app.post("/predict", tags=["Prediction"])
@app.post("/api/predict", tags=["Prediction"])
async def predict_endpoint(payload: dict[str, Any] = Body(default_factory=dict)) -> dict[str, Any]:
    """Prediction API endpoint for real-time risk assessment and makePrediction() integration."""
    return await ai_client.predict_risk(payload)


