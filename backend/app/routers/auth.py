from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user, get_user_mine_ids
from app.models.mine import Mine
from app.models.mine_assignment import MineAssignment
from app.models.user import User
from app.schemas.auth import MeResponse
from app.schemas.mine import MineResponse
from app.schemas.user import UserResponse, UserUpdate

router = APIRouter()


@router.get("/me", response_model=MeResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Get current authenticated user profile and assigned mines."""
    # Get assigned mines
    stmt = (
        select(Mine)
        .join(MineAssignment, Mine.id == MineAssignment.mine_id)
        .where(MineAssignment.user_id == current_user.id)
    )
    result = await db.execute(stmt)
    assigned_mines = result.scalars().all()

    return {
        "user": current_user,
        "assigned_mines": assigned_mines,
    }


@router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Update current authenticated user profile."""
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    if payload.phone is not None:
        current_user.phone = payload.phone
    if payload.department is not None:
        current_user.department = payload.department

    await db.commit()
    await db.refresh(current_user)
    return current_user
