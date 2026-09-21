from __future__ import annotations
from typing import Optional, List, Dict, Any, Union
from typing import List, Dict, Any, Optional, Union
"""Alert schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.alert import AlertSeverity, AlertType
from .common import PaginationMeta


class AlertBase(BaseModel):
    type: AlertType
    severity: AlertSeverity
    title: str
    message: str


class AlertCreate(AlertBase):
    mine_id: Optional[UUID] = None
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[UUID] = None
    escalation_level: int = 0


class AlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    mine_id: Optional[UUID] = None
    type: AlertType
    severity: AlertSeverity
    title: str
    message: str
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[UUID] = None
    is_read: bool
    is_resolved: bool
    escalation_level: int
    created_at: datetime
    resolved_at: Optional[datetime] = None


class AlertListResponse(BaseModel):
    data: List[AlertResponse]
    meta: PaginationMeta


class AlertUnreadCountResponse(BaseModel):
    count: int
