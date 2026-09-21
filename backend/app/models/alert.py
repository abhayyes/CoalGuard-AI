from __future__ import annotations
from typing import List, Dict, Any, Optional
from typing import Optional
import enum
from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class AlertType(str, enum.Enum):
    compliance_due = "compliance_due"
    compliance_overdue = "compliance_overdue"
    high_risk_observation = "high_risk_observation"
    contract_expiring = "contract_expiring"
    corrective_action_overdue = "corrective_action_overdue"
    ai_anomaly = "ai_anomaly"
    inspection_pending = "inspection_pending"


class AlertSeverity(str, enum.Enum):
    info = "info"
    warning = "warning"
    critical = "critical"


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    mine_id: Mapped[Optional[str]] = mapped_column(UUID(as_uuid=False), ForeignKey("mines.id"))
    type: Mapped[AlertType] = mapped_column(Enum(AlertType, name="alert_type_enum"), nullable=False)
    severity: Mapped[AlertSeverity] = mapped_column(
        Enum(AlertSeverity, name="alert_severity_enum"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    related_entity_type: Mapped[Optional[str]] = mapped_column(String(50))
    related_entity_id: Mapped[Optional[str]] = mapped_column(UUID(as_uuid=False))
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    is_resolved: Mapped[bool] = mapped_column(Boolean, default=False)
    escalation_level: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    # Relationships
    mine = relationship("Mine", back_populates="alerts")
