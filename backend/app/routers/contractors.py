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
from app.models.contractor import (
    Contractor,
    ContractorComplianceStatus,
)
from app.models.user import User, UserRole
from app.schemas.contractor import (
    ContractorCreate,
    ContractorListResponse,
    ContractorResponse,
    ContractorUpdate,
)

router = APIRouter()


@router.get("", response_model=ContractorListResponse)
async def list_contractors(
    mine_id: UUID | None = None,
    compliance_status: ContractorComplianceStatus | None = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """List contractors with optional filters and pagination."""
    query = select(Contractor)
    count_query = select(func.count(Contractor.id))

    role_str = current_user.role.value if isinstance(current_user.role, UserRole) else str(current_user.role)
    if role_str not in [UserRole.admin.value, UserRole.corporate.value, UserRole.regulatory.value]:
        user_mine_ids = await get_user_mine_ids(db, current_user.id)
        query = query.where(Contractor.mine_id.in_(user_mine_ids))
        count_query = count_query.where(Contractor.mine_id.in_(user_mine_ids))

    if mine_id:
        query = query.where(Contractor.mine_id == str(mine_id))
        count_query = count_query.where(Contractor.mine_id == str(mine_id))
    if compliance_status:
        query = query.where(Contractor.compliance_status == compliance_status)
        count_query = count_query.where(Contractor.compliance_status == compliance_status)

    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    offset = (page - 1) * per_page
    query = query.order_by(Contractor.name.asc()).offset(offset).limit(per_page)

    result = await db.execute(query)
    contractors = result.scalars().all()

    return {
        "data": contractors,
        "meta": {
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": ceil(total / per_page) if total > 0 else 1,
        },
    }


@router.get("/expiring", response_model=ContractorListResponse)
async def get_expiring_contractors(
    days: int = Query(30, ge=1, le=180),
    mine_id: UUID | None = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Get contracts expiring within N days."""
    today = date.today()
    future = today + timedelta(days=days)

    query = select(Contractor).where(Contractor.contract_end >= today, Contractor.contract_end <= future)
    count_query = select(func.count(Contractor.id)).where(Contractor.contract_end >= today, Contractor.contract_end <= future)

    role_str = current_user.role.value if isinstance(current_user.role, UserRole) else str(current_user.role)
    if role_str not in [UserRole.admin.value, UserRole.corporate.value, UserRole.regulatory.value]:
        user_mine_ids = await get_user_mine_ids(db, current_user.id)
        query = query.where(Contractor.mine_id.in_(user_mine_ids))
        count_query = count_query.where(Contractor.mine_id.in_(user_mine_ids))

    if mine_id:
        query = query.where(Contractor.mine_id == str(mine_id))
        count_query = count_query.where(Contractor.mine_id == str(mine_id))

    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    offset = (page - 1) * per_page
    query = query.order_by(Contractor.contract_end.asc()).offset(offset).limit(per_page)

    result = await db.execute(query)
    contractors = result.scalars().all()

    return {
        "data": contractors,
        "meta": {
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": ceil(total / per_page) if total > 0 else 1,
        },
    }


@router.post("", response_model=ContractorResponse, status_code=status.HTTP_201_CREATED)
async def create_contractor(
    payload: ContractorCreate,
    current_user: User = Depends(require_role(UserRole.admin, UserRole.mine_official)),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Create a new contractor entry."""
    user_mine_ids = await get_user_mine_ids(db, current_user.id)
    if not check_mine_access(current_user, payload.mine_id, user_mine_ids):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this mine")

    contractor = Contractor(
        name=payload.name,
        mine_id=str(payload.mine_id),
        contract_number=payload.contract_number,
        contract_start=payload.contract_start,
        contract_end=payload.contract_end,
        scope_of_work=payload.scope_of_work,
        worker_count=payload.worker_count,
        compliance_status=payload.compliance_status,
        documents=payload.documents,
        training_records=payload.training_records,
        is_active=True,
    )
    db.add(contractor)
    await db.commit()
    await db.refresh(contractor)
    return contractor


@router.get("/{contractor_id}", response_model=ContractorResponse)
async def get_contractor_detail(
    contractor_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Get contractor detail by ID."""
    stmt = select(Contractor).where(Contractor.id == str(contractor_id))
    contractor = (await db.execute(stmt)).scalars().first()
    if not contractor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contractor not found")
    return contractor


@router.put("/{contractor_id}", response_model=ContractorResponse)
async def update_contractor(
    contractor_id: UUID,
    payload: ContractorUpdate,
    current_user: User = Depends(require_role(UserRole.admin, UserRole.mine_official)),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Update contractor details."""
    stmt = select(Contractor).where(Contractor.id == str(contractor_id))
    contractor = (await db.execute(stmt)).scalars().first()
    if not contractor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contractor not found")

    if payload.name is not None:
        contractor.name = payload.name
    if payload.contract_number is not None:
        contractor.contract_number = payload.contract_number
    if payload.contract_start is not None:
        contractor.contract_start = payload.contract_start
    if payload.contract_end is not None:
        contractor.contract_end = payload.contract_end
    if payload.scope_of_work is not None:
        contractor.scope_of_work = payload.scope_of_work
    if payload.worker_count is not None:
        contractor.worker_count = payload.worker_count
    if payload.compliance_status is not None:
        contractor.compliance_status = payload.compliance_status
    if payload.documents is not None:
        contractor.documents = payload.documents
    if payload.training_records is not None:
        contractor.training_records = payload.training_records
    if payload.is_active is not None:
        contractor.is_active = payload.is_active

    await db.commit()
    await db.refresh(contractor)
    return contractor
