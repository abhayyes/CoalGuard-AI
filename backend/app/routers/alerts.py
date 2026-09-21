from __future__ import annotations
from typing import List, Dict, Any, Optional, Union
from datetime import datetime
from math import ceil
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import (
    get_current_user,
    get_user_mine_ids,
)
from app.models.alert import Alert, AlertSeverity, AlertType
from app.models.user import User, UserRole
from app.schemas.alert import (
    AlertListResponse,
    AlertResponse,
    AlertUnreadCountResponse,
)

router = APIRouter()


@router.get("", response_model=AlertListResponse)
async def list_alerts(
    mine_id: UUID | None = None,
    type: AlertType | None = None,
    severity: AlertSeverity | None = None,
    is_read: Optional[bool] = None,
    is_resolved: Optional[bool] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """List alerts with filtering and pagination."""
    query = select(Alert)
    count_query = select(func.count(Alert.id))

    role_str = current_user.role.value if isinstance(current_user.role, UserRole) else str(current_user.role)
    if role_str not in [UserRole.admin.value, UserRole.corporate.value, UserRole.regulatory.value]:
        user_mine_ids = await get_user_mine_ids(db, current_user.id)
        query = query.where((Alert.mine_id.in_(user_mine_ids)) | (Alert.mine_id.is_(None)))
        count_query = count_query.where((Alert.mine_id.in_(user_mine_ids)) | (Alert.mine_id.is_(None)))

    if mine_id:
        query = query.where(Alert.mine_id == str(mine_id))
        count_query = count_query.where(Alert.mine_id == str(mine_id))
    if type:
        query = query.where(Alert.type == type)
        count_query = count_query.where(Alert.type == type)
    if severity:
        query = query.where(Alert.severity == severity)
        count_query = count_query.where(Alert.severity == severity)
    if is_read is not None:
        query = query.where(Alert.is_read == is_read)
        count_query = count_query.where(Alert.is_read == is_read)
    if is_resolved is not None:
        query = query.where(Alert.is_resolved == is_resolved)
        count_query = count_query.where(Alert.is_resolved == is_resolved)

    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    offset = (page - 1) * per_page
    query = query.order_by(Alert.created_at.desc()).offset(offset).limit(per_page)

    result = await db.execute(query)
    alerts = result.scalars().all()

    return {
        "data": alerts,
        "meta": {
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": ceil(total / per_page) if total > 0 else 1,
        },
    }


@router.get("/unread-count", response_model=AlertUnreadCountResponse)
async def get_unread_alert_count(
    mine_id: UUID | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Get count of unread alerts."""
    query = select(func.count(Alert.id)).where(Alert.is_read == False)  # noqa: E712

    role_str = current_user.role.value if isinstance(current_user.role, UserRole) else str(current_user.role)
    if role_str not in [UserRole.admin.value, UserRole.corporate.value, UserRole.regulatory.value]:
        user_mine_ids = await get_user_mine_ids(db, current_user.id)
        query = query.where((Alert.mine_id.in_(user_mine_ids)) | (Alert.mine_id.is_(None)))

    if mine_id:
        query = query.where(Alert.mine_id == str(mine_id))

    result = await db.execute(query)
    count = result.scalar_one()

    return {"count": count}


@router.put("/{alert_id}/read", response_model=AlertResponse)
async def mark_alert_read(
    alert_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Mark an alert as read."""
    stmt = select(Alert).where(Alert.id == str(alert_id))
    alert = (await db.execute(stmt)).scalars().first()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")

    alert.is_read = True
    await db.commit()
    await db.refresh(alert)
    return alert


@router.put("/{alert_id}/resolve", response_model=AlertResponse)
async def resolve_alert(
    alert_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Mark an alert as resolved."""
    stmt = select(Alert).where(Alert.id == str(alert_id))
    alert = (await db.execute(stmt)).scalars().first()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")

    alert.is_resolved = True
    alert.resolved_at = datetime.utcnow()
    await db.commit()
    await db.refresh(alert)
    return alert
