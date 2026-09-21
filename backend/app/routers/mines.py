from __future__ import annotations
from typing import List, Dict, Any, Optional, Union
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
from app.models.compliance import Compliance, ComplianceStatus
from app.models.corrective_action import CorrectiveAction, CorrectiveActionStatus
from app.models.mine import Mine
from app.models.observation import Observation, ObservationStatus
from app.models.risk_score import RiskScore
from app.models.user import User, UserRole
from app.schemas.mine import (
    MineCreate,
    MineListResponse,
    MineResponse,
    MineSummaryResponse,
    MineUpdate,
)

router = APIRouter()


@router.get("", response_model=MineListResponse)
async def list_mines(
    state: Optional[str] = None,
    is_active: Optional[bool] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """List mines scoped by user role/assignment with pagination."""
    query = select(Mine)
    count_query = select(func.count(Mine.id))

    # Scoping
    role_str = current_user.role.value if isinstance(current_user.role, UserRole) else str(current_user.role)
    if role_str not in [UserRole.admin.value, UserRole.corporate.value, UserRole.regulatory.value]:
        user_mine_ids = await get_user_mine_ids(db, current_user.id)
        query = query.where(Mine.id.in_(user_mine_ids))
        count_query = count_query.where(Mine.id.in_(user_mine_ids))

    if state:
        query = query.where(Mine.state.ilike(f"%{state}%"))
        count_query = count_query.where(Mine.state.ilike(f"%{state}%"))
    if is_active is not None:
        query = query.where(Mine.is_active == is_active)
        count_query = count_query.where(Mine.is_active == is_active)

    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    offset = (page - 1) * per_page
    query = query.order_by(Mine.name.asc()).offset(offset).limit(per_page)

    result = await db.execute(query)
    mines = result.scalars().all()

    return {
        "data": mines,
        "meta": {
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": ceil(total / per_page) if total > 0 else 1,
        },
    }


@router.get("/geojson")
async def get_mines_geojson(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Get all visible mines formatted as GeoJSON FeatureCollection."""
    query = select(Mine).where(Mine.is_active == True)  # noqa: E712

    role_str = current_user.role.value if isinstance(current_user.role, UserRole) else str(current_user.role)
    if role_str not in [UserRole.admin.value, UserRole.corporate.value, UserRole.regulatory.value]:
        user_mine_ids = await get_user_mine_ids(db, current_user.id)
        query = query.where(Mine.id.in_(user_mine_ids))

    result = await db.execute(query)
    mines = result.scalars().all()

    features = []
    for mine in mines:
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [float(mine.longitude), float(mine.latitude)],
            },
            "properties": {
                "id": str(mine.id),
                "name": mine.name,
                "code": mine.code,
                "state": mine.state,
                "mine_type": mine.mine_type.value if mine.mine_type else None,
                "boundary_geojson": mine.boundary_geojson,
            },
        })

    return {
        "type": "FeatureCollection",
        "features": features,
    }


@router.post("", response_model=MineResponse, status_code=status.HTTP_201_CREATED)
async def create_mine(
    payload: MineCreate,
    _current_user: User = Depends(require_role(UserRole.admin)),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Create a new mine (Admin only)."""
    mine = Mine(
        name=payload.name,
        code=payload.code,
        subsidiary=payload.subsidiary,
        state=payload.state,
        district=payload.district,
        location_description=payload.location_description,
        latitude=payload.latitude,
        longitude=payload.longitude,
        boundary_geojson=payload.boundary_geojson,
        mine_type=payload.mine_type,
        is_active=True,
    )
    db.add(mine)
    await db.commit()
    await db.refresh(mine)
    return mine


@router.get("/{mine_id}", response_model=MineResponse)
async def get_mine_detail(
    mine_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Get mine detail by ID."""
    user_mine_ids = await get_user_mine_ids(db, current_user.id)
    if not check_mine_access(current_user, mine_id, user_mine_ids):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this mine")

    stmt = select(Mine).where(Mine.id == str(mine_id))
    mine = (await db.execute(stmt)).scalars().first()
    if not mine:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mine not found")
    return mine


@router.put("/{mine_id}", response_model=MineResponse)
async def update_mine(
    mine_id: UUID,
    payload: MineUpdate,
    _current_user: User = Depends(require_role(UserRole.admin)),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Update mine by ID (Admin only)."""
    stmt = select(Mine).where(Mine.id == str(mine_id))
    mine = (await db.execute(stmt)).scalars().first()
    if not mine:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mine not found")

    if payload.name is not None:
        mine.name = payload.name
    if payload.code is not None:
        mine.code = payload.code
    if payload.subsidiary is not None:
        mine.subsidiary = payload.subsidiary
    if payload.state is not None:
        mine.state = payload.state
    if payload.district is not None:
        mine.district = payload.district
    if payload.location_description is not None:
        mine.location_description = payload.location_description
    if payload.latitude is not None:
        mine.latitude = payload.latitude
    if payload.longitude is not None:
        mine.longitude = payload.longitude
    if payload.boundary_geojson is not None:
        mine.boundary_geojson = payload.boundary_geojson
    if payload.mine_type is not None:
        mine.mine_type = payload.mine_type
    if payload.is_active is not None:
        mine.is_active = payload.is_active

    await db.commit()
    await db.refresh(mine)
    return mine


@router.get("/{mine_id}/summary", response_model=MineSummaryResponse)
async def get_mine_summary(
    mine_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Get KPI summary for a specific mine."""
    user_mine_ids = await get_user_mine_ids(db, current_user.id)
    if not check_mine_access(current_user, mine_id, user_mine_ids):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this mine")

    stmt = select(Mine).where(Mine.id == str(mine_id))
    mine = (await db.execute(stmt)).scalars().first()
    if not mine:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mine not found")

    # Total and completed compliance
    total_comp_stmt = select(func.count(Compliance.id)).where(Compliance.mine_id == str(mine_id))
    total_comp = (await db.execute(total_comp_stmt)).scalar_one()

    completed_comp_stmt = select(func.count(Compliance.id)).where(
        Compliance.mine_id == str(mine_id), Compliance.status == ComplianceStatus.completed
    )
    completed_comp = (await db.execute(completed_comp_stmt)).scalar_one()
    compliance_rate = round((completed_comp / total_comp * 100), 1) if total_comp > 0 else 100.0

    # Open observations
    obs_stmt = (
        select(func.count(Observation.id))
        .join(Mine, Observation.inspection)
        .where(
            Observation.status.in_([ObservationStatus.open, ObservationStatus.in_progress]),
        )
    )
    open_obs = 0
    try:
        open_obs_stmt = (
            select(func.count(Observation.id))
            .join(Observation.inspection)
            .where(
                Observation.status.in_([ObservationStatus.open, ObservationStatus.in_progress])
            )
        )
        # Query observations by mine through inspections
        from app.models.inspection import Inspection
        open_obs_query = (
            select(func.count(Observation.id))
            .join(Inspection, Observation.inspection_id == Inspection.id)
            .where(
                Inspection.mine_id == str(mine_id),
                Observation.status.in_([ObservationStatus.open, ObservationStatus.in_progress, ObservationStatus.action_assigned]),
            )
        )
        open_obs = (await db.execute(open_obs_query)).scalar_one()
    except Exception:
        open_obs = 0

    # Latest risk score
    risk_stmt = (
        select(RiskScore.overall_score)
        .where(RiskScore.mine_id == str(mine_id))
        .order_by(RiskScore.calculated_at.desc())
        .limit(1)
    )
    risk_res = (await db.execute(risk_stmt)).scalar_one_or_none()
    risk_score = float(risk_res) if risk_res is not None else 15.0

    # Pending actions count
    pending_actions = 0
    try:
        from app.models.inspection import Inspection
        actions_query = (
            select(func.count(CorrectiveAction.id))
            .join(Observation, CorrectiveAction.observation_id == Observation.id)
            .join(Inspection, Observation.inspection_id == Inspection.id)
            .where(
                Inspection.mine_id == str(mine_id),
                CorrectiveAction.status.in_([CorrectiveActionStatus.assigned, CorrectiveActionStatus.in_progress]),
            )
        )
        pending_actions = (await db.execute(actions_query)).scalar_one()
    except Exception:
        pending_actions = 0

    return {
        "mine_id": mine.id,
        "mine_name": mine.name,
        "compliance_rate": compliance_rate,
        "open_observations": open_obs,
        "risk_score": risk_score,
        "pending_actions": pending_actions,
    }
