from __future__ import annotations
from typing import List, Dict, Any, Optional
from typing import Optional
import enum
from datetime import date, datetime
from uuid import uuid4

from sqlalchemy import Boolean, Date, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ContractorComplianceStatus(str, enum.Enum):
    compliant = "compliant"
    non_compliant = "non_compliant"
    partially_compliant = "partially_compliant"
    under_review = "under_review"


class Contractor(Base):
    __tablename__ = "contractors"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    mine_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("mines.id"), nullable=False)
    contract_number: Mapped[Optional[str]] = mapped_column(String(100))
    contract_start: Mapped[date] = mapped_column(Date, nullable=False)
    contract_end: Mapped[date] = mapped_column(Date, nullable=False)
    scope_of_work: Mapped[Optional[str]] = mapped_column(Text)
    worker_count: Mapped[int] = mapped_column(Integer, default=0)
    compliance_status: Mapped[ContractorComplianceStatus] = mapped_column(
        Enum(ContractorComplianceStatus, name="contractor_compliance_status_enum"),
        default=ContractorComplianceStatus.under_review,
    )
    documents: Mapped[Optional[Any]] = mapped_column(JSON)
    training_records: Mapped[Optional[Any]] = mapped_column(JSON)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    mine = relationship("Mine", back_populates="contractors")
