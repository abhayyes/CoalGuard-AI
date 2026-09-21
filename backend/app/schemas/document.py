from __future__ import annotations
from typing import Optional, List, Dict, Any, Union
"""Document schemas."""

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.document import OCRStatus
from .common import PaginationMeta


class DocumentBase(BaseModel):
    file_name: str
    file_url: str


class DocumentCreate(DocumentBase):
    mine_id: Optional[UUID] = None
    file_type: Optional[str] = None
    file_size_bytes: Optional[int] = None
    linked_compliance_id: Optional[UUID] = None


class DocumentUpdate(BaseModel):
    file_name: Optional[str] = None
    ocr_extracted_fields: Dict[str, Optional[Any]] = None
    linked_compliance_id: Optional[UUID] = None


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    mine_id: Optional[UUID] = None
    uploaded_by: Optional[UUID] = None
    file_name: str
    file_url: str
    file_type: Optional[str] = None
    file_size_bytes: Optional[int] = None
    ocr_status: OCRStatus
    ocr_extracted_text: Optional[str] = None
    ocr_extracted_fields: Dict[str, Optional[Any]] = None
    linked_compliance_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime


class DocumentListResponse(BaseModel):
    data: List[DocumentResponse]
    meta: PaginationMeta
