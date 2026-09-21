from __future__ import annotations
from typing import List, Dict, Any, Optional, Union
from math import ceil
from typing import Any
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import require_role
from app.models.mine_assignment import MineAssignment
from app.models.user import User, UserRole
from app.schemas.common import MessageResponse, SuccessResponse
from app.schemas.user import (
    UserCreate,
    UserListResponse,
    UserResponse,
    UserUpdate,
)

router = APIRouter()


@router.get("", response_model=UserListResponse)
async def list_users(
    role: UserRole | None = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    _current_user: User = Depends(require_role(UserRole.admin)),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """List all users with optional filtering and pagination (Admin only)."""
    query = select(User)
    count_query = select(func.count(User.id))

    if role:
        query = query.where(User.role == role)
        count_query = count_query.where(User.role == role)
    if is_active is not None:
        query = query.where(User.is_active == is_active)
        count_query = count_query.where(User.is_active == is_active)
    if search:
        search_filter = (User.full_name.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%"))
        query = query.where(search_filter)
        count_query = count_query.where(search_filter)

    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    offset = (page - 1) * per_page
    query = query.order_by(User.created_at.desc()).offset(offset).limit(per_page)

    result = await db.execute(query)
    users = result.scalars().all()

    return {
        "data": users,
        "meta": {
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": ceil(total / per_page) if total > 0 else 1,
        },
    }


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    payload: UserCreate,
    _current_user: User = Depends(require_role(UserRole.admin)),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Create a new user (Admin only)."""
    # Check if user already exists with email
    stmt = select(User).where(User.email == payload.email)
    existing = (await db.execute(stmt)).scalars().first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists",
        )

    user = User(
        supabase_uid=str(uuid4()),
        email=payload.email,
        full_name=payload.full_name,
        role=payload.role,
        department=payload.department,
        phone=payload.phone,
        is_active=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_detail(
    user_id: UUID,
    _current_user: User = Depends(require_role(UserRole.admin)),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Get user details by ID (Admin only)."""
    stmt = select(User).where(User.id == str(user_id))
    user = (await db.execute(stmt)).scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: UUID,
    payload: UserUpdate,
    _current_user: User = Depends(require_role(UserRole.admin)),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Update user by ID (Admin only)."""
    stmt = select(User).where(User.id == str(user_id))
    user = (await db.execute(stmt)).scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if payload.email is not None:
        user.email = payload.email
    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.role is not None:
        user.role = payload.role
    if payload.department is not None:
        user.department = payload.department
    if payload.phone is not None:
        user.phone = payload.phone
    if payload.is_active is not None:
        user.is_active = payload.is_active

    await db.commit()
    await db.refresh(user)
    return user


@router.delete("/{user_id}", response_model=SuccessResponse)
async def deactivate_user(
    user_id: UUID,
    _current_user: User = Depends(require_role(UserRole.admin)),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Deactivate user (soft delete, Admin only)."""
    stmt = select(User).where(User.id == str(user_id))
    user = (await db.execute(stmt)).scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.is_active = False
    await db.commit()
    return {"success": True, "message": "User deactivated successfully"}


@router.post("/{user_id}/assign-mine", response_model=MessageResponse)
async def assign_user_to_mine(
    user_id: UUID,
    mine_id: UUID,
    _current_user: User = Depends(require_role(UserRole.admin)),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Assign a user to a mine (Admin only)."""
    stmt = select(MineAssignment).where(
        MineAssignment.user_id == str(user_id), MineAssignment.mine_id == str(mine_id)
    )
    existing = (await db.execute(stmt)).scalars().first()
    if existing:
        return {"message": "User already assigned to this mine"}

    assignment = MineAssignment(user_id=str(user_id), mine_id=str(mine_id))
    db.add(assignment)
    await db.commit()
    return {"message": "User successfully assigned to mine"}


@router.delete("/{user_id}/assign-mine/{mine_id}", response_model=MessageResponse)
async def remove_user_mine_assignment(
    user_id: UUID,
    mine_id: UUID,
    _current_user: User = Depends(require_role(UserRole.admin)),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Remove user assignment from a mine (Admin only)."""
    stmt = select(MineAssignment).where(
        MineAssignment.user_id == str(user_id), MineAssignment.mine_id == str(mine_id)
    )
    assignment = (await db.execute(stmt)).scalars().first()
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")

    await db.delete(assignment)
    await db.commit()
    return {"message": "Mine assignment removed successfully"}
