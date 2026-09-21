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
    mine_id: UUID | None = None
    related_entity_type: str | None = None
    related_entity_id: UUID | None = None
    escalation_level: int = 0


class AlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    mine_id: UUID | None = None
    type: AlertType
    severity: AlertSeverity
    title: str
    message: str
    related_entity_type: str | None = None
    related_entity_id: UUID | None = None
    is_read: bool
    is_resolved: bool
    escalation_level: int
    created_at: datetime
    resolved_at: datetime | None = None


class AlertListResponse(BaseModel):
    data: list[AlertResponse]
    meta: PaginationMeta


class AlertUnreadCountResponse(BaseModel):
    count: int
