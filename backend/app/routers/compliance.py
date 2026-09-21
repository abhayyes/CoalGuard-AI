from __future__ import annotations
from typing import List, Dict, Any, Optional, Union
from datetime import date, timedelta
from math import ceil
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import (
    check_mine_access,
    get_current_user,
    get_user_mine_ids,
    require_role,
)
from app.models.compliance import (
    Compliance,
    ComplianceCategory,
    ComplianceStatus,
    RiskLevel,
)
from app.models.user import User, UserRole
from app.schemas.compliance import (
    ComplianceCreate,
    ComplianceListResponse,
    ComplianceResponse,
    ComplianceStatsResponse,
    ComplianceUpdate,
)

router = APIRouter()


@router.get("", response_model=ComplianceListResponse)
async def list_compliance(
    mine_id: UUID | None = None,
    status: ComplianceStatus | None = None,
    category: ComplianceCategory | None = None,
    risk_level: RiskLevel | None = None,
    due_before: Optional[date] = None,
    due_after: Optional[date] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """List compliance items with filters and pagination."""
    query = select(Compliance)
    count_query = select(func.count(Compliance.id))

    # Scoping
    role_str = current_user.role.value if isinstance(current_user.role, UserRole) else str(current_user.role)
    if role_str not in [UserRole.admin.value, UserRole.corporate.value, UserRole.regulatory.value]:
        user_mine_ids = await get_user_mine_ids(db, current_user.id)
        query = query.where(Compliance.mine_id.in_(user_mine_ids))
        count_query = count_query.where(Compliance.mine_id.in_(user_mine_ids))

    if mine_id:
        query = query.where(Compliance.mine_id == str(mine_id))
        count_query = count_query.where(Compliance.mine_id == str(mine_id))
    if status:
        query = query.where(Compliance.status == status)
        count_query = count_query.where(Compliance.status == status)
    if category:
        query = query.where(Compliance.category == category)
        count_query = count_query.where(Compliance.category == category)
    if risk_level:
        query = query.where(Compliance.risk_level == risk_level)
        count_query = count_query.where(Compliance.risk_level == risk_level)
    if due_before:
        query = query.where(Compliance.due_date <= due_before)
        count_query = count_query.where(Compliance.due_date <= due_before)
    if due_after:
        query = query.where(Compliance.due_date >= due_after)
        count_query = count_query.where(Compliance.due_date >= due_after)

    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    offset = (page - 1) * per_page
    query = query.order_by(Compliance.due_date.asc()).offset(offset).limit(per_page)

    result = await db.execute(query)
    items = result.scalars().all()

    return {
        "data": items,
        "meta": {
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": ceil(total / per_page) if total > 0 else 1,
        },
    }


@router.get("/stats", response_model=ComplianceStatsResponse)
async def get_compliance_stats(
    mine_id: UUID | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Get aggregated compliance statistics."""
    query = select(Compliance)
    role_str = current_user.role.value if isinstance(current_user.role, UserRole) else str(current_user.role)
    if role_str not in [UserRole.admin.value, UserRole.corporate.value, UserRole.regulatory.value]:
        user_mine_ids = await get_user_mine_ids(db, current_user.id)
        query = query.where(Compliance.mine_id.in_(user_mine_ids))

    if mine_id:
        query = query.where(Compliance.mine_id == str(mine_id))

    result = await db.execute(query)
    all_items = result.scalars().all()

    total = len(all_items)
    completed = sum(1 for i in all_items if i.status == ComplianceStatus.completed)
    pending = sum(1 for i in all_items if i.status == ComplianceStatus.pending)
    in_progress = sum(1 for i in all_items if i.status == ComplianceStatus.in_progress)
    overdue = sum(1 for i in all_items if i.status == ComplianceStatus.overdue or (i.status != ComplianceStatus.completed and i.due_date < date.today()))

    rate = round((completed / total * 100), 1) if total > 0 else 100.0

    by_category: Dict[str, int] = {}
    for item in all_items:
        cat_key = item.category.value if isinstance(item.category, ComplianceCategory) else str(item.category)
        by_category[cat_key] = by_category.get(cat_key, 0) + 1

    return {
        "total": total,
        "completed": completed,
        "pending": pending,
        "in_progress": in_progress,
        "overdue": overdue,
        "compliance_rate": rate,
        "by_category": by_category,
    }


@router.get("/overdue", response_model=ComplianceListResponse)
async def get_overdue_compliance(
    mine_id: UUID | None = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Get all overdue compliance items."""
    today = date.today()
    query = select(Compliance).where(
        (Compliance.status == ComplianceStatus.overdue) | ((Compliance.due_date < today) & (Compliance.status != ComplianceStatus.completed))
    )
    count_query = select(func.count(Compliance.id)).where(
        (Compliance.status == ComplianceStatus.overdue) | ((Compliance.due_date < today) & (Compliance.status != ComplianceStatus.completed))
    )

    role_str = current_user.role.value if isinstance(current_user.role, UserRole) else str(current_user.role)
    if role_str not in [UserRole.admin.value, UserRole.corporate.value, UserRole.regulatory.value]:
        user_mine_ids = await get_user_mine_ids(db, current_user.id)
        query = query.where(Compliance.mine_id.in_(user_mine_ids))
        count_query = count_query.where(Compliance.mine_id.in_(user_mine_ids))

    if mine_id:
        query = query.where(Compliance.mine_id == str(mine_id))
        count_query = count_query.where(Compliance.mine_id == str(mine_id))

    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    offset = (page - 1) * per_page
    query = query.order_by(Compliance.due_date.asc()).offset(offset).limit(per_page)

    result = await db.execute(query)
    items = result.scalars().all()

    return {
        "data": items,
        "meta": {
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": ceil(total / per_page) if total > 0 else 1,
        },
    }


@router.get("/upcoming", response_model=ComplianceListResponse)
async def get_upcoming_compliance(
    days: int = Query(30, ge=1, le=365),
    mine_id: UUID | None = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Get compliance items due in next N days."""
    today = date.today()
    future = today + timedelta(days=days)

    query = select(Compliance).where(
        Compliance.due_date >= today,
        Compliance.due_date <= future,
        Compliance.status != ComplianceStatus.completed,
    )
    count_query = select(func.count(Compliance.id)).where(
        Compliance.due_date >= today,
        Compliance.due_date <= future,
        Compliance.status != ComplianceStatus.completed,
    )

    role_str = current_user.role.value if isinstance(current_user.role, UserRole) else str(current_user.role)
    if role_str not in [UserRole.admin.value, UserRole.corporate.value, UserRole.regulatory.value]:
        user_mine_ids = await get_user_mine_ids(db, current_user.id)
        query = query.where(Compliance.mine_id.in_(user_mine_ids))
        count_query = count_query.where(Compliance.mine_id.in_(user_mine_ids))

    if mine_id:
        query = query.where(Compliance.mine_id == str(mine_id))
        count_query = count_query.where(Compliance.mine_id == str(mine_id))

    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    offset = (page - 1) * per_page
    query = query.order_by(Compliance.due_date.asc()).offset(offset).limit(per_page)

    result = await db.execute(query)
    items = result.scalars().all()

    return {
        "data": items,
        "meta": {
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": ceil(total / per_page) if total > 0 else 1,
        },
    }


@router.post("", response_model=ComplianceResponse, status_code=status.HTTP_201_CREATED)
async def create_compliance_item(
    payload: ComplianceCreate,
    current_user: User = Depends(require_role(UserRole.admin, UserRole.mine_official, UserRole.safety_officer, UserRole.env_officer)),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Create a new compliance record."""
    user_mine_ids = await get_user_mine_ids(db, current_user.id)
    if not check_mine_access(current_user, payload.mine_id, user_mine_ids):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this mine")

    item = Compliance(
        mine_id=str(payload.mine_id),
        requirement=payload.requirement,
        category=payload.category,
        sub_category=payload.sub_category,
        due_date=payload.due_date,
        responsible_user_id=str(payload.responsible_user_id) if payload.responsible_user_id else None,
        status=ComplianceStatus.pending,
        risk_level=payload.risk_level,
        document_url=payload.document_url,
        created_by=str(current_user.id),
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.get("/{compliance_id}", response_model=ComplianceResponse)
async def get_compliance_detail(
    compliance_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Get compliance item detail."""
    stmt = select(Compliance).where(Compliance.id == str(compliance_id))
    item = (await db.execute(stmt)).scalars().first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Compliance item not found")

    user_mine_ids = await get_user_mine_ids(db, current_user.id)
    if not check_mine_access(current_user, item.mine_id, user_mine_ids):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this compliance item")

    return item


@router.put("/{compliance_id}", response_model=ComplianceResponse)
async def update_compliance(
    compliance_id: UUID,
    payload: ComplianceUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Update compliance item."""
    stmt = select(Compliance).where(Compliance.id == str(compliance_id))
    item = (await db.execute(stmt)).scalars().first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Compliance item not found")

    user_mine_ids = await get_user_mine_ids(db, current_user.id)
    if not check_mine_access(current_user, item.mine_id, user_mine_ids):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    if payload.requirement is not None:
        item.requirement = payload.requirement
    if payload.category is not None:
        item.category = payload.category
    if payload.sub_category is not None:
        item.sub_category = payload.sub_category
    if payload.due_date is not None:
        item.due_date = payload.due_date
    if payload.responsible_user_id is not None:
        item.responsible_user_id = str(payload.responsible_user_id)
    if payload.status is not None:
        item.status = payload.status
        if payload.status == ComplianceStatus.completed and not item.completion_date:
            item.completion_date = date.today()
    if payload.risk_level is not None:
        item.risk_level = payload.risk_level
    if payload.document_url is not None:
        item.document_url = payload.document_url
    if payload.completion_date is not None:
        item.completion_date = payload.completion_date
    if payload.completion_notes is not None:
        item.completion_notes = payload.completion_notes

    await db.commit()
    await db.refresh(item)
    return item
