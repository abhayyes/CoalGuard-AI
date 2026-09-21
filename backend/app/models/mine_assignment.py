from __future__ import annotations
from typing import List, Dict, Any, Optional
from typing import Optional
from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class MineAssignment(Base):
    __tablename__ = "mine_assignments"
    __table_args__ = (UniqueConstraint("user_id", "mine_id", name="uq_user_mine"),)

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)
    mine_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("mines.id"), nullable=False)
    assigned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="mine_assignments")
    mine = relationship("Mine", back_populates="assignments")
