import enum
from datetime import datetime
from uuid import uuid4

from sqlalchemy import ARRAY, DateTime, Enum, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ObservationSeverity(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class ObservationCategory(str, enum.Enum):
    safety = "safety"
    environmental = "environmental"
    structural = "structural"
    equipment = "equipment"
    procedural = "procedural"
    other = "other"


class ObservationStatus(str, enum.Enum):
    open = "open"
    action_assigned = "action_assigned"
    in_progress = "in_progress"
    resolved = "resolved"
    verified = "verified"
    closed = "closed"


class Observation(Base):
    __tablename__ = "observations"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=uuid4)
    inspection_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("inspections.id"), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    severity: Mapped[ObservationSeverity] = mapped_column(
        Enum(ObservationSeverity, name="observation_severity_enum"), nullable=False
    )
    category: Mapped[ObservationCategory] = mapped_column(
        Enum(ObservationCategory, name="observation_category_enum"), default=ObservationCategory.other
    )
    photo_urls: Mapped[list[str] | None] = mapped_column(ARRAY(Text))
    latitude: Mapped[float | None] = mapped_column(Numeric(10, 7))
    longitude: Mapped[float | None] = mapped_column(Numeric(10, 7))
    status: Mapped[ObservationStatus] = mapped_column(
        Enum(ObservationStatus, name="observation_status_enum"), default=ObservationStatus.open
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    inspection = relationship("Inspection", back_populates="observations")
    corrective_actions = relationship(
        "CorrectiveAction", back_populates="observation", lazy="selectin", cascade="all, delete-orphan"
    )
