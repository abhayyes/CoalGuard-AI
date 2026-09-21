from __future__ import annotations
from typing import List, Dict, Any, Optional
from typing import Optional
from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.compliance import RiskLevel


class RiskScore(Base):
    __tablename__ = "risk_scores"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=uuid4)
    mine_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("mines.id"), nullable=False)
    overall_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    compliance_risk: Mapped[Optional[float]] = mapped_column(Numeric(5, 2))
    safety_risk: Mapped[Optional[float]] = mapped_column(Numeric(5, 2))
    environmental_risk: Mapped[Optional[float]] = mapped_column(Numeric(5, 2))
    historical_risk: Mapped[Optional[float]] = mapped_column(Numeric(5, 2))
    operational_risk: Mapped[Optional[float]] = mapped_column(Numeric(5, 2))
    risk_level: Mapped[Optional[RiskLevel]] = mapped_column(Enum(RiskLevel, name="risk_level_enum"))
    anomalies: Mapped[Optional[Any]] = mapped_column(JSON)
    recommendations: Mapped[Optional[Any]] = mapped_column(JSON)
    calculated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    mine = relationship("Mine", back_populates="risk_scores")
