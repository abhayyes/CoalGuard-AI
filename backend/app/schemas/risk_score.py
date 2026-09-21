from __future__ import annotations
from typing import Optional, List, Dict, Any, Union
from typing import List, Dict, Any, Optional, Union
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
    compliance_risk: Optional[Decimal] = None
    safety_risk: Optional[Decimal] = None
    environmental_risk: Optional[Decimal] = None
    historical_risk: Optional[Decimal] = None
    operational_risk: Optional[Decimal] = None
    risk_level: Optional[RiskLevel] = None
    anomalies: Optional[Any] = None
    recommendations: Optional[Any] = None
    calculated_at: datetime


class RiskHistoryResponse(BaseModel):
    mine_id: UUID
    history: List[RiskScoreResponse]


class CorporateRiskSummaryItem(BaseModel):
    mine_id: UUID
    mine_name: str
    state: str
    overall_score: Decimal
    risk_level: Optional[RiskLevel] = None
    open_observations: int
    overdue_compliance: int


class CorporateRiskSummaryResponse(BaseModel):
    data: List[CorporateRiskSummaryItem]
