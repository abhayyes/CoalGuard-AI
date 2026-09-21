from datetime import date, datetime
from math import ceil
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user, require_role
from app.models.corrective_action import (
    CorrectiveAction,
    CorrectiveActionStatus,
)
from app.models.observation import Observation, ObservationStatus
from app.models.user import User, UserRole
from app.schemas.corrective_action import (
    CorrectiveActionListResponse,
    CorrectiveActionResponse,
    CorrectiveActionUpdate,
    CorrectiveActionVerify,
)

router = APIRouter()


@router.get("", response_model=CorrectiveActionListResponse)
async def list_corrective_actions(
    assigned_to: UUID | None = None,
    status: CorrectiveActionStatus | None = None,
    overdue: bool | None = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """List corrective actions with filtering and pagination."""
    query = select(CorrectiveAction)
    count_query = select(func.count(CorrectiveAction.id))

    if assigned_to:
        query = query.where(CorrectiveAction.assigned_to == str(assigned_to))
        count_query = count_query.where(CorrectiveAction.assigned_to == str(assigned_to))

    if status:
        query = query.where(CorrectiveAction.status == status)
        count_query = count_query.where(CorrectiveAction.status == status)

    if overdue is True:
        today = date.today()
        query = query.where(
            (CorrectiveAction.status == CorrectiveActionStatus.overdue)
            | (
                (CorrectiveAction.deadline < today)
                & (CorrectiveAction.status != CorrectiveActionStatus.completed)
                & (CorrectiveAction.status != CorrectiveActionStatus.verified)
            )
        )
        count_query = count_query.where(
            (CorrectiveAction.status == CorrectiveActionStatus.overdue)
            | (
                (CorrectiveAction.deadline < today)
                & (CorrectiveAction.status != CorrectiveActionStatus.completed)
                & (CorrectiveAction.status != CorrectiveActionStatus.verified)
            )
        )

    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    offset = (page - 1) * per_page
    query = query.order_by(CorrectiveAction.deadline.asc()).offset(offset).limit(per_page)

    result = await db.execute(query)
    actions = result.scalars().all()

    return {
        "data": actions,
        "meta": {
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": ceil(total / per_page) if total > 0 else 1,
        },
    }


@router.get("/{action_id}", response_model=CorrectiveActionResponse)
async def get_corrective_action_detail(
    action_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Get corrective action details by ID."""
    stmt = select(CorrectiveAction).where(CorrectiveAction.id == str(action_id))
    action = (await db.execute(stmt)).scalars().first()
    if not action:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Corrective action not found")
    return action


@router.put("/{action_id}", response_model=CorrectiveActionResponse)
async def update_corrective_action(
    action_id: UUID,
    payload: CorrectiveActionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Update corrective action status, add completion notes/evidence."""
    stmt = select(CorrectiveAction).where(CorrectiveAction.id == str(action_id))
    action = (await db.execute(stmt)).scalars().first()
    if not action:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Corrective action not found")

    if payload.description is not None:
        action.description = payload.description
    if payload.assigned_to is not None:
        action.assigned_to = str(payload.assigned_to)
    if payload.deadline is not None:
        action.deadline = payload.deadline
    if payload.status is not None:
        action.status = payload.status
        if payload.status == CorrectiveActionStatus.completed and not action.completed_at:
            action.completed_at = datetime.utcnow()
    if payload.completion_notes is not None:
        action.completion_notes = payload.completion_notes
    if payload.completion_photo_url is not None:
        action.completion_photo_url = payload.completion_photo_url

    await db.commit()
    await db.refresh(action)
    return action


@router.post("/{action_id}/verify", response_model=CorrectiveActionResponse)
async def verify_corrective_action(
    action_id: UUID,
    payload: CorrectiveActionVerify,
    current_user: User = Depends(require_role(UserRole.admin, UserRole.mine_official, UserRole.safety_officer)),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Verify and close a completed corrective action."""
    stmt = select(CorrectiveAction).where(CorrectiveAction.id == str(action_id))
    action = (await db.execute(stmt)).scalars().first()
    if not action:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Corrective action not found")

    if payload.verified:
        action.status = CorrectiveActionStatus.verified
        action.verified_by = str(current_user.id)
        action.verified_at = datetime.utcnow()

        # Update parent observation status to resolved/verified
        obs_stmt = select(Observation).where(Observation.id == action.observation_id)
        obs = (await db.execute(obs_stmt)).scalars().first()
        if obs:
            obs.status = ObservationStatus.verified

    await db.commit()
    await db.refresh(action)
    return action
