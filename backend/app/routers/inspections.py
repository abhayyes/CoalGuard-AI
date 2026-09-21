from datetime import date
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
from app.models.inspection import Inspection, InspectionStatus, InspectionType
from app.models.observation import Observation
from app.models.user import User, UserRole
from app.schemas.inspection import (
    InspectionCreate,
    InspectionListResponse,
    InspectionResponse,
    InspectionUpdate,
)

router = APIRouter()


@router.get("", response_model=InspectionListResponse)
async def list_inspections(
    mine_id: UUID | None = None,
    inspector_id: UUID | None = None,
    type: InspectionType | None = None,
    status: InspectionStatus | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """List inspections with filtering and pagination."""
    query = select(Inspection).options(selectinload(Inspection.observations))
    count_query = select(func.count(Inspection.id))

    role_str = current_user.role.value if isinstance(current_user.role, UserRole) else str(current_user.role)
    if role_str not in [UserRole.admin.value, UserRole.corporate.value, UserRole.regulatory.value]:
        user_mine_ids = await get_user_mine_ids(db, current_user.id)
        query = query.where(Inspection.mine_id.in_(user_mine_ids))
        count_query = count_query.where(Inspection.mine_id.in_(user_mine_ids))

    if mine_id:
        query = query.where(Inspection.mine_id == str(mine_id))
        count_query = count_query.where(Inspection.mine_id == str(mine_id))
    if inspector_id:
        query = query.where(Inspection.inspector_id == str(inspector_id))
        count_query = count_query.where(Inspection.inspector_id == str(inspector_id))
    if type:
        query = query.where(Inspection.inspection_type == type)
        count_query = count_query.where(Inspection.inspection_type == type)
    if status:
        query = query.where(Inspection.status == status)
        count_query = count_query.where(Inspection.status == status)
    if date_from:
        query = query.where(Inspection.date >= date_from)
        count_query = count_query.where(Inspection.date >= date_from)
    if date_to:
        query = query.where(Inspection.date <= date_to)
        count_query = count_query.where(Inspection.date <= date_to)

    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    offset = (page - 1) * per_page
    query = query.order_by(Inspection.date.desc()).offset(offset).limit(per_page)

    result = await db.execute(query)
    inspections = result.scalars().all()

    return {
        "data": inspections,
        "meta": {
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": ceil(total / per_page) if total > 0 else 1,
        },
    }


@router.get("/geojson")
async def get_inspections_geojson(
    mine_id: UUID | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Get inspection locations formatted as GeoJSON."""
    query = select(Inspection).where(Inspection.latitude.isnot(None), Inspection.longitude.isnot(None))

    role_str = current_user.role.value if isinstance(current_user.role, UserRole) else str(current_user.role)
    if role_str not in [UserRole.admin.value, UserRole.corporate.value, UserRole.regulatory.value]:
        user_mine_ids = await get_user_mine_ids(db, current_user.id)
        query = query.where(Inspection.mine_id.in_(user_mine_ids))

    if mine_id:
        query = query.where(Inspection.mine_id == str(mine_id))

    result = await db.execute(query)
    inspections = result.scalars().all()

    features = []
    for insp in inspections:
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [float(insp.longitude), float(insp.latitude)],
            },
            "properties": {
                "id": str(insp.id),
                "mine_id": str(insp.mine_id),
                "inspection_type": insp.inspection_type.value if insp.inspection_type else None,
                "date": str(insp.date),
                "status": insp.status.value if insp.status else None,
                "summary": insp.summary,
            },
        })

    return {
        "type": "FeatureCollection",
        "features": features,
    }


@router.post("", response_model=InspectionResponse, status_code=status.HTTP_201_CREATED)
async def create_inspection(
    payload: InspectionCreate,
    current_user: User = Depends(require_role(UserRole.admin, UserRole.mine_official, UserRole.inspector, UserRole.safety_officer, UserRole.env_officer)),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Create a new inspection."""
    user_mine_ids = await get_user_mine_ids(db, current_user.id)
    if not check_mine_access(current_user, payload.mine_id, user_mine_ids):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this mine")

    inspector_id = str(payload.inspector_id) if payload.inspector_id else str(current_user.id)

    inspection = Inspection(
        mine_id=str(payload.mine_id),
        inspector_id=inspector_id,
        inspection_type=payload.inspection_type,
        date=payload.date,
        latitude=payload.latitude,
        longitude=payload.longitude,
        checklist_data=payload.checklist_data,
        summary=payload.summary,
        status=InspectionStatus.draft,
    )
    db.add(inspection)
    await db.commit()
    await db.refresh(inspection)
    return inspection


@router.get("/{inspection_id}", response_model=InspectionResponse)
async def get_inspection_detail(
    inspection_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Get inspection details with observations."""
    stmt = (
        select(Inspection)
        .options(selectinload(Inspection.observations).selectinload(Observation.corrective_actions))
        .where(Inspection.id == str(inspection_id))
    )
    inspection = (await db.execute(stmt)).scalars().first()
    if not inspection:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inspection not found")

    user_mine_ids = await get_user_mine_ids(db, current_user.id)
    if not check_mine_access(current_user, inspection.mine_id, user_mine_ids):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return inspection


@router.put("/{inspection_id}", response_model=InspectionResponse)
async def update_inspection(
    inspection_id: UUID,
    payload: InspectionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Update inspection details."""
    stmt = select(Inspection).where(Inspection.id == str(inspection_id))
    inspection = (await db.execute(stmt)).scalars().first()
    if not inspection:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inspection not found")

    user_mine_ids = await get_user_mine_ids(db, current_user.id)
    if not check_mine_access(current_user, inspection.mine_id, user_mine_ids):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    if payload.inspection_type is not None:
        inspection.inspection_type = payload.inspection_type
    if payload.date is not None:
        inspection.date = payload.date
    if payload.latitude is not None:
        inspection.latitude = payload.latitude
    if payload.longitude is not None:
        inspection.longitude = payload.longitude
    if payload.checklist_data is not None:
        inspection.checklist_data = payload.checklist_data
    if payload.summary is not None:
        inspection.summary = payload.summary
    if payload.status is not None:
        inspection.status = payload.status

    await db.commit()
    await db.refresh(inspection)
    return inspection


@router.post("/{inspection_id}/complete", response_model=InspectionResponse)
async def complete_inspection(
    inspection_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Mark an inspection as completed."""
    stmt = select(Inspection).where(Inspection.id == str(inspection_id))
    inspection = (await db.execute(stmt)).scalars().first()
    if not inspection:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inspection not found")

    inspection.status = InspectionStatus.completed
    await db.commit()
    await db.refresh(inspection)
    return inspection
