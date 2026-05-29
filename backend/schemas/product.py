from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class ProductResponse(BaseModel):
    """Продукт в ответе API."""

    model_config = ConfigDict(populate_by_name=True)

    id: int
    name: str = Field(..., max_length=20)
    price: Decimal
    product_url: str = Field(..., serialization_alias="productUrl")
    has_image: bool = Field(..., serialization_alias="hasImage")
    image_url: Optional[str] = Field(None, serialization_alias="imageUrl")


class ProductCreate(BaseModel):
    """Поля продукта без изображения (файл передаётся отдельно в multipart)."""

    model_config = ConfigDict(populate_by_name=True)

    name: str = Field(..., min_length=1, max_length=20)
    price: Decimal = Field(..., ge=0)
    product_url: HttpUrl = Field(..., alias="productUrl")


class ProductUpdate(BaseModel):
    """Обновление полей продукта (изображение опционально в multipart)."""

    model_config = ConfigDict(populate_by_name=True)

    name: str = Field(..., min_length=1, max_length=20)
    price: Decimal = Field(..., ge=0)
    product_url: HttpUrl = Field(..., alias="productUrl")
