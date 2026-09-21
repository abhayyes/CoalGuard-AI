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
)
from app.models.document import Document, OCRStatus
from app.models.user import User, UserRole
from app.schemas.common import MessageResponse
from app.schemas.document import (
    DocumentCreate,
    DocumentListResponse,
    DocumentResponse,
    DocumentUpdate,
)

router = APIRouter()


@router.get("", response_model=DocumentListResponse)
async def list_documents(
    mine_id: UUID | None = None,
    ocr_status: OCRStatus | None = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """List documents with optional filtering and pagination."""
    query = select(Document)
    count_query = select(func.count(Document.id))

    role_str = current_user.role.value if isinstance(current_user.role, UserRole) else str(current_user.role)
    if role_str not in [UserRole.admin.value, UserRole.corporate.value, UserRole.regulatory.value]:
        user_mine_ids = await get_user_mine_ids(db, current_user.id)
        query = query.where(Document.mine_id.in_(user_mine_ids))
        count_query = count_query.where(Document.mine_id.in_(user_mine_ids))

    if mine_id:
        query = query.where(Document.mine_id == str(mine_id))
        count_query = count_query.where(Document.mine_id == str(mine_id))
    if ocr_status:
        query = query.where(Document.ocr_status == ocr_status)
        count_query = count_query.where(Document.ocr_status == ocr_status)

    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    offset = (page - 1) * per_page
    query = query.order_by(Document.created_at.desc()).offset(offset).limit(per_page)

    result = await db.execute(query)
    documents = result.scalars().all()

    return {
        "data": documents,
        "meta": {
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": ceil(total / per_page) if total > 0 else 1,
        },
    }


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_document(
    payload: DocumentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Register an uploaded document."""
    if payload.mine_id:
        user_mine_ids = await get_user_mine_ids(db, current_user.id)
        if not check_mine_access(current_user, payload.mine_id, user_mine_ids):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this mine")

    doc = Document(
        mine_id=str(payload.mine_id) if payload.mine_id else None,
        uploaded_by=str(current_user.id),
        file_name=payload.file_name,
        file_url=payload.file_url,
        file_type=payload.file_type,
        file_size_bytes=payload.file_size_bytes,
        ocr_status=OCRStatus.completed,
        linked_compliance_id=str(payload.linked_compliance_id) if payload.linked_compliance_id else None,
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return doc


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document_detail(
    document_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Get document details by ID."""
    stmt = select(Document).where(Document.id == str(document_id))
    doc = (await db.execute(stmt)).scalars().first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return doc


@router.put("/{document_id}", response_model=DocumentResponse)
async def update_document(
    document_id: UUID,
    payload: DocumentUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Update document metadata or extracted fields."""
    stmt = select(Document).where(Document.id == str(document_id))
    doc = (await db.execute(stmt)).scalars().first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    if payload.file_name is not None:
        doc.file_name = payload.file_name
    if payload.ocr_extracted_fields is not None:
        doc.ocr_extracted_fields = payload.ocr_extracted_fields
    if payload.linked_compliance_id is not None:
        doc.linked_compliance_id = str(payload.linked_compliance_id)

    await db.commit()
    await db.refresh(doc)
    return doc


@router.post("/{document_id}/link", response_model=MessageResponse)
async def link_document_to_compliance(
    document_id: UUID,
    compliance_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Link a document to a compliance record."""
    stmt = select(Document).where(Document.id == str(document_id))
    doc = (await db.execute(stmt)).scalars().first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    doc.linked_compliance_id = str(compliance_id)
    await db.commit()
    return {"message": "Document successfully linked to compliance item"}
