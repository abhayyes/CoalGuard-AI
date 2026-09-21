"""Corrective Action schemas."""

from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.corrective_action import CorrectiveActionStatus
from .common import PaginationMeta


class CorrectiveActionBase(BaseModel):
    observation_id: UUID
    description: str
    assigned_to: UUID
    deadline: date


class CorrectiveActionCreate(CorrectiveActionBase):
    assigned_by: UUID | None = None


class CorrectiveActionUpdate(BaseModel):
    description: str | None = None
    assigned_to: UUID | None = None
    deadline: date | None = None
    status: CorrectiveActionStatus | None = None
    completion_notes: str | None = None
    completion_photo_url: str | None = None


class CorrectiveActionVerify(BaseModel):
    verified: bool = True
    notes: str | None = None


class CorrectiveActionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    observation_id: UUID
    description: str
    assigned_to: UUID
    assigned_by: UUID
    deadline: date
    status: CorrectiveActionStatus
    completion_notes: str | None = None
    completion_photo_url: str | None = None
    completed_at: datetime | None = None
    verified_by: UUID | None = None
    verified_at: datetime | None = None
    created_at: datetime
    updated_at: datetime


class CorrectiveActionListResponse(BaseModel):
    data: list[CorrectiveActionResponse]
    meta: PaginationMeta
