from __future__ import annotations
from typing import Optional, List, Dict, Any, Union
from typing import List, Dict, Any, Optional, Union
"""Auth schemas."""

from uuid import UUID
from pydantic import BaseModel, EmailStr

from .user import UserResponse
from .mine import MineResponse


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class MeResponse(BaseModel):
    user: UserResponse
    assigned_mines: List[MineResponse] = []
