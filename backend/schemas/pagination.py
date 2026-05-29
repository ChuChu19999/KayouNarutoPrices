from typing import Generic, TypeVar
from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    """Универсальная схема для пагинированных ответов."""

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    items: list[T]
    total: int
    page: int
    page_size: int = Field(..., serialization_alias="pageSize")
    total_pages: int = Field(..., serialization_alias="totalPages")
