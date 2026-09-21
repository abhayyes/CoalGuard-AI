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
    mine_id: UUID | None = None
    file_type: str | None = None
    file_size_bytes: int | None = None
    linked_compliance_id: UUID | None = None


class DocumentUpdate(BaseModel):
    file_name: str | None = None
    ocr_extracted_fields: dict[str, Any] | None = None
    linked_compliance_id: UUID | None = None


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    mine_id: UUID | None = None
    uploaded_by: UUID | None = None
    file_name: str
    file_url: str
    file_type: str | None = None
    file_size_bytes: int | None = None
    ocr_status: OCRStatus
    ocr_extracted_text: str | None = None
    ocr_extracted_fields: dict[str, Any] | None = None
    linked_compliance_id: UUID | None = None
    created_at: datetime
    updated_at: datetime


class DocumentListResponse(BaseModel):
    data: list[DocumentResponse]
    meta: PaginationMeta
