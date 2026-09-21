"""Common schemas shared across modules."""

from typing import Any, Generic, TypeVar
from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class PaginationMeta(BaseModel):
    total: int
    page: int
    per_page: int
    total_pages: int


class PaginatedResponse(BaseModel, Generic[T]):
    data: list[Any]  # overridden in concrete subclasses
    meta: PaginationMeta


class ErrorDetail(BaseModel):
    field: str | None = None
    message: str


class ErrorResponse(BaseModel):
    code: str
    message: str
    details: list[ErrorDetail] | None = None


class SuccessResponse(BaseModel):
    success: bool = True
    message: str = "Operation completed successfully"


class MessageResponse(BaseModel):
    message: str
