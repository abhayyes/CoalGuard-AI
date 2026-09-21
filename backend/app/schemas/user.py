from __future__ import annotations
from typing import Optional, List, Dict, Any, Union
from typing import List, Dict, Any, Optional, Union
"""User schemas."""

from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr

from .common import PaginatedResponse, PaginationMeta


class UserRole(str, Enum):
    admin = "admin"
    mine_official = "mine_official"
    safety_officer = "safety_officer"
    env_officer = "env_officer"
    inspector = "inspector"
    corporate = "corporate"
    regulatory = "regulatory"
    contractor = "contractor"


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole


class UserCreate(UserBase):
    password: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    supabase_uid: Optional[UUID] = None
    email: str
    full_name: str
    role: UserRole
    department: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class UserListResponse(BaseModel):
    data: List[UserResponse]
    meta: PaginationMeta
