from __future__ import annotations
from typing import List, Dict, Any, Optional
from typing import Optional
import enum
from datetime import date, datetime
from uuid import uuid4

from sqlalchemy import Date, DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ComplianceCategory(str, enum.Enum):
    statutory = "statutory"
    environmental = "environmental"
    safety = "safety"
    operational = "operational"
    labor = "labor"
    financial = "financial"


class ComplianceStatus(str, enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    overdue = "overdue"


class RiskLevel(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class Compliance(Base):
    __tablename__ = "compliance"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    mine_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("mines.id"), nullable=False)
    requirement: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[ComplianceCategory] = mapped_column(
        Enum(ComplianceCategory, name="compliance_category_enum"), nullable=False
    )
    sub_category: Mapped[Optional[str]] = mapped_column(String(255))
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    responsible_user_id: Mapped[Optional[str]] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id"))
    status: Mapped[ComplianceStatus] = mapped_column(
        Enum(ComplianceStatus, name="compliance_status_enum"), default=ComplianceStatus.pending
    )
    risk_level: Mapped[Optional[RiskLevel]] = mapped_column(Enum(RiskLevel, name="risk_level_enum"))
    document_url: Mapped[Optional[str]] = mapped_column(Text)
    completion_date: Mapped[Optional[date]] = mapped_column(Date)
    completion_notes: Mapped[Optional[str]] = mapped_column(Text)
    created_by: Mapped[Optional[str]] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    mine = relationship("Mine", back_populates="compliance_items")
    responsible_user = relationship("User", foreign_keys=[responsible_user_id])
    creator = relationship("User", foreign_keys=[created_by])
