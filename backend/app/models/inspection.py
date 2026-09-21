import enum
from datetime import date, datetime
from uuid import uuid4

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Numeric, Text
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class InspectionType(str, enum.Enum):
    routine = "routine"
    safety = "safety"
    environmental = "environmental"
    special = "special"
    follow_up = "follow_up"


class InspectionStatus(str, enum.Enum):
    draft = "draft"
    in_progress = "in_progress"
    completed = "completed"
    reviewed = "reviewed"


class Inspection(Base):
    __tablename__ = "inspections"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=uuid4)
    mine_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("mines.id"), nullable=False)
    inspector_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)
    inspection_type: Mapped[InspectionType] = mapped_column(
        Enum(InspectionType, name="inspection_type_enum"), nullable=False
    )
    date: Mapped[date] = mapped_column(Date, nullable=False)
    latitude: Mapped[float | None] = mapped_column(Numeric(10, 7))
    longitude: Mapped[float | None] = mapped_column(Numeric(10, 7))
    checklist_data: Mapped[dict | None] = mapped_column(JSON)
    summary: Mapped[str | None] = mapped_column(Text)
    status: Mapped[InspectionStatus] = mapped_column(
        Enum(InspectionStatus, name="inspection_status_enum"), default=InspectionStatus.draft
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    mine = relationship("Mine", back_populates="inspections")
    inspector = relationship("User", back_populates="inspections")
    observations = relationship("Observation", back_populates="inspection", lazy="selectin", cascade="all, delete-orphan")
