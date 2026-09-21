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
    password: str | None = None
    department: str | None = None
    phone: str | None = None


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    full_name: str | None = None
    role: UserRole | None = None
    department: str | None = None
    phone: str | None = None
    is_active: bool | None = None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    supabase_uid: UUID | None = None
    email: str
    full_name: str
    role: UserRole
    department: str | None = None
    phone: str | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class UserListResponse(BaseModel):
    data: list[UserResponse]
    meta: PaginationMeta
