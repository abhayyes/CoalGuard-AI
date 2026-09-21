import enum
from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, Enum, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class MineType(str, enum.Enum):
    opencast = "opencast"
    underground = "underground"
    mixed = "mixed"


class Mine(Base):
    __tablename__ = "mines"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str | None] = mapped_column(String(50), unique=True)
    subsidiary: Mapped[str | None] = mapped_column(String(255))
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    district: Mapped[str | None] = mapped_column(String(100))
    location_description: Mapped[str | None] = mapped_column(Text)
    latitude: Mapped[float] = mapped_column(Numeric(10, 7), nullable=False)
    longitude: Mapped[float] = mapped_column(Numeric(10, 7), nullable=False)
    boundary_geojson: Mapped[dict | None] = mapped_column(JSON)
    mine_type: Mapped[MineType | None] = mapped_column(Enum(MineType, name="mine_type_enum"))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    assignments = relationship("MineAssignment", back_populates="mine", lazy="selectin")
    compliance_items = relationship("Compliance", back_populates="mine", lazy="selectin")
    inspections = relationship("Inspection", back_populates="mine", lazy="selectin")
    contractors = relationship("Contractor", back_populates="mine", lazy="selectin")
    alerts = relationship("Alert", back_populates="mine", lazy="selectin")
    documents = relationship("Document", back_populates="mine", lazy="selectin")
    risk_scores = relationship("RiskScore", back_populates="mine", lazy="selectin")
