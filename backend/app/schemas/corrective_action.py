from __future__ import annotations
from typing import Optional, List, Dict, Any, Union
from typing import List, Dict, Any, Optional, Union
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
    assigned_by: Optional[UUID] = None


class CorrectiveActionUpdate(BaseModel):
    description: Optional[str] = None
    assigned_to: Optional[UUID] = None
    deadline: Optional[date] = None
    status: Optional[CorrectiveActionStatus] = None
    completion_notes: Optional[str] = None
    completion_photo_url: Optional[str] = None


class CorrectiveActionVerify(BaseModel):
    verified: bool = True
    notes: Optional[str] = None


class CorrectiveActionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    observation_id: UUID
    description: str
    assigned_to: UUID
    assigned_by: UUID
    deadline: date
    status: CorrectiveActionStatus
    completion_notes: Optional[str] = None
    completion_photo_url: Optional[str] = None
    completed_at: Optional[datetime] = None
    verified_by: Optional[UUID] = None
    verified_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class CorrectiveActionListResponse(BaseModel):
    data: List[CorrectiveActionResponse]
    meta: PaginationMeta
