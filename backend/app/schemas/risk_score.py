"""Risk Score schemas."""

from datetime import datetime
from decimal import Decimal
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.compliance import RiskLevel


class RiskScoreResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    mine_id: UUID
    overall_score: Decimal
    compliance_risk: Decimal | None = None
    safety_risk: Decimal | None = None
    environmental_risk: Decimal | None = None
    historical_risk: Decimal | None = None
    operational_risk: Decimal | None = None
    risk_level: RiskLevel | None = None
    anomalies: Any | None = None
    recommendations: Any | None = None
    calculated_at: datetime


class RiskHistoryResponse(BaseModel):
    mine_id: UUID
    history: list[RiskScoreResponse]


class CorporateRiskSummaryItem(BaseModel):
    mine_id: UUID
    mine_name: str
    state: str
    overall_score: Decimal
    risk_level: RiskLevel | None = None
    open_observations: int
    overdue_compliance: int


class CorporateRiskSummaryResponse(BaseModel):
    data: list[CorporateRiskSummaryItem]
