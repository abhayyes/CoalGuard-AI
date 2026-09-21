from __future__ import annotations
from typing import List, Dict, Any, Optional
from typing import Optional
import enum
from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class OCRStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    mine_id: Mapped[Optional[str]] = mapped_column(UUID(as_uuid=False), ForeignKey("mines.id"))
    uploaded_by: Mapped[Optional[str]] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id"))
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_url: Mapped[str] = mapped_column(Text, nullable=False)
    file_type: Mapped[Optional[str]] = mapped_column(String(50))
    file_size_bytes: Mapped[Optional[int]] = mapped_column(Integer)
    ocr_status: Mapped[OCRStatus] = mapped_column(
        Enum(OCRStatus, name="ocr_status_enum"), default=OCRStatus.pending
    )
    ocr_extracted_text: Mapped[Optional[str]] = mapped_column(Text)
    ocr_extracted_fields: Mapped[Optional[dict]] = mapped_column(JSON)
    linked_compliance_id: Mapped[Optional[str]] = mapped_column(UUID(as_uuid=False), ForeignKey("compliance.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    mine = relationship("Mine", back_populates="documents")
    uploader = relationship("User", foreign_keys=[uploaded_by])
    linked_compliance = relationship("Compliance", foreign_keys=[linked_compliance_id])
