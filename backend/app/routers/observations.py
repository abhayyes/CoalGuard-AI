from math import ceil
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.middleware.auth import (
    check_mine_access,
    get_current_user,
    get_user_mine_ids,
    require_role,
)
from app.models.corrective_action import CorrectiveAction, CorrectiveActionStatus
from app.models.inspection import Inspection
from app.models.observation import (
    Observation,
    ObservationCategory,
    ObservationSeverity,
    ObservationStatus,
)
from app.models.user import User, UserRole
from app.schemas.corrective_action import (
    CorrectiveActionCreate,
    CorrectiveActionResponse,
)
from app.schemas.observation import (
    ObservationCreate,
    ObservationListResponse,
    ObservationResponse,
    ObservationUpdate,
)

router = APIRouter()


@router.get("", response_model=ObservationListResponse)
async def list_observations(
    inspection_id: UUID | None = None,
    mine_id: UUID | None = None,
    severity: ObservationSeverity | None = None,
    status: ObservationStatus | None = None,
    category: ObservationCategory | None = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """List observations with filters and pagination."""
    query = select(Observation).options(selectinload(Observation.corrective_actions))
    count_query = select(func.count(Observation.id))

    if inspection_id:
        query = query.where(Observation.inspection_id == str(inspection_id))
        count_query = count_query.where(Observation.inspection_id == str(inspection_id))

    if mine_id:
        query = query.join(Inspection, Observation.inspection_id == Inspection.id).where(Inspection.mine_id == str(mine_id))
        count_query = count_query.join(Inspection, Observation.inspection_id == Inspection.id).where(Inspection.mine_id == str(mine_id))

    if severity:
        query = query.where(Observation.severity == severity)
        count_query = count_query.where(Observation.severity == severity)
    if status:
        query = query.where(Observation.status == status)
        count_query = count_query.where(Observation.status == status)
    if category:
        query = query.where(Observation.category == category)
        count_query = count_query.where(Observation.category == category)

    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    offset = (page - 1) * per_page
    query = query.order_by(Observation.created_at.desc()).offset(offset).limit(per_page)

    result = await db.execute(query)
    observations = result.scalars().all()

    return {
        "data": observations,
        "meta": {
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": ceil(total / per_page) if total > 0 else 1,
        },
    }


@router.get("/geojson")
async def get_observations_geojson(
    mine_id: UUID | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Get observation points formatted as GeoJSON."""
    query = (
        select(Observation)
        .where(Observation.latitude.isnot(None), Observation.longitude.isnot(None))
    )

    if mine_id:
        query = query.join(Inspection, Observation.inspection_id == Inspection.id).where(Inspection.mine_id == str(mine_id))

    result = await db.execute(query)
    observations = result.scalars().all()

    features = []
    for obs in observations:
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [float(obs.longitude), float(obs.latitude)],
            },
            "properties": {
                "id": str(obs.id),
                "inspection_id": str(obs.inspection_id),
                "description": obs.description,
                "severity": obs.severity.value if obs.severity else None,
                "category": obs.category.value if obs.category else None,
                "status": obs.status.value if obs.status else None,
            },
        })

    return {
        "type": "FeatureCollection",
        "features": features,
    }


@router.post("", response_model=ObservationResponse, status_code=status.HTTP_201_CREATED)
async def create_observation(
    payload: ObservationCreate,
    current_user: User = Depends(require_role(UserRole.admin, UserRole.mine_official, UserRole.inspector, UserRole.safety_officer, UserRole.env_officer)),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Create a new observation under an inspection."""
    insp_stmt = select(Inspection).where(Inspection.id == str(payload.inspection_id))
    insp = (await db.execute(insp_stmt)).scalars().first()
    if not insp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inspection not found")

    observation = Observation(
        inspection_id=str(payload.inspection_id),
        description=payload.description,
        severity=payload.severity,
        category=payload.category,
        photo_urls=payload.photo_urls,
        latitude=payload.latitude,
        longitude=payload.longitude,
        status=ObservationStatus.open,
    )
    db.add(observation)
    await db.commit()
    await db.refresh(observation)
    return observation


@router.get("/{observation_id}", response_model=ObservationResponse)
async def get_observation_detail(
    observation_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Get observation details with corrective actions."""
    stmt = (
        select(Observation)
        .options(selectinload(Observation.corrective_actions))
        .where(Observation.id == str(observation_id))
    )
    observation = (await db.execute(stmt)).scalars().first()
    if not observation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Observation not found")
    return observation


@router.put("/{observation_id}", response_model=ObservationResponse)
async def update_observation(
    observation_id: UUID,
    payload: ObservationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Update observation details."""
    stmt = select(Observation).where(Observation.id == str(observation_id))
    observation = (await db.execute(stmt)).scalars().first()
    if not observation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Observation not found")

    if payload.description is not None:
        observation.description = payload.description
    if payload.severity is not None:
        observation.severity = payload.severity
    if payload.category is not None:
        observation.category = payload.category
    if payload.photo_urls is not None:
        observation.photo_urls = payload.photo_urls
    if payload.latitude is not None:
        observation.latitude = payload.latitude
    if payload.longitude is not None:
        observation.longitude = payload.longitude
    if payload.status is not None:
        observation.status = payload.status

    await db.commit()
    await db.refresh(observation)
    return observation


@router.post("/{observation_id}/corrective-action", response_model=CorrectiveActionResponse, status_code=status.HTTP_201_CREATED)
async def create_corrective_action_for_observation(
    observation_id: UUID,
    payload: CorrectiveActionCreate,
    current_user: User = Depends(require_role(UserRole.admin, UserRole.mine_official, UserRole.safety_officer)),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Assign a corrective action to an observation."""
    stmt = select(Observation).where(Observation.id == str(observation_id))
    observation = (await db.execute(stmt)).scalars().first()
    if not observation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Observation not found")

    action = CorrectiveAction(
        observation_id=str(observation_id),
        description=payload.description,
        assigned_to=str(payload.assigned_to),
        assigned_by=str(current_user.id),
        deadline=payload.deadline,
        status=CorrectiveActionStatus.assigned,
    )
    db.add(action)

    # Update observation status
    observation.status = ObservationStatus.action_assigned
    await db.commit()
    await db.refresh(action)
    return action
