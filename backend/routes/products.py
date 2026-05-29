from decimal import Decimal
from typing import Optional
from fastapi import APIRouter, Depends, File, Form, Query, Response, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from schemas.pagination import PaginatedResponse
from schemas.product import ProductCreate, ProductResponse, ProductUpdate
from services.products import (
    build_paginated_meta,
    create_product,
    delete_product,
    get_product_image_row,
    list_products,
    to_product_response,
    update_product,
)
from utils.image_upload import read_image_upload

router = APIRouter()


@router.get(
    "/",
    response_model=PaginatedResponse[ProductResponse],
    summary="Список продуктов Kayou Naruto",
    description="Каталог с пагинацией, сортировкой (name, price, id) и поиском по наименованию.",
)
async def get_products(
    page: int = Query(1, ge=1, description="Номер страницы"),
    page_size: int = Query(
        20, ge=1, le=100, alias="pageSize", description="Размер страницы"
    ),
    sort_by: Optional[str] = Query(
        "name", alias="sortBy", description="Поле сортировки: name, price, id"
    ),
    sort_order: Optional[str] = Query(
        "asc", alias="sortOrder", description="Порядок: asc или desc"
    ),
    search: Optional[str] = Query(
        None, min_length=1, description="Поиск по наименованию"
    ),
    db: AsyncSession = Depends(get_db),
):
    """Каталог продуктов для таблицы на фронтенде."""
    items, total = await list_products(
        db,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
        search=search,
    )
    meta = build_paginated_meta(total, page, page_size)
    return PaginatedResponse[ProductResponse](
        items=[to_product_response(p) for p in items],
        **meta,
    )


@router.get(
    "/{product_id}/image",
    summary="Изображение продукта",
    responses={
        200: {"content": {"image/*": {}}},
        404: {"description": "Изображение не найдено"},
    },
)
async def get_product_image(
    product_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Отдача бинарного изображения из БД."""
    image = await get_product_image_row(db, product_id)
    return Response(
        content=image.content,
        media_type=image.content_type,
        headers={"Cache-Control": "public, max-age=3600"},
    )


@router.post(
    "/",
    response_model=ProductResponse,
    status_code=201,
    summary="Добавить продукт",
)
async def post_product(
    name: str = Form(..., min_length=1, max_length=20),
    price: Decimal = Form(..., ge=0),
    product_url: str = Form(..., alias="productUrl"),
    image: UploadFile = File(..., description="Файл изображения"),
    db: AsyncSession = Depends(get_db),
):
    """Создание записи в каталоге с загрузкой изображения (multipart)."""
    image_content, content_type = await read_image_upload(image)
    payload = ProductCreate.model_validate(
        {"name": name, "price": price, "productUrl": product_url}
    )
    product = await create_product(
        db,
        payload,
        image_content=image_content,
        content_type=content_type,
    )
    return to_product_response(product)


@router.patch(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Изменить продукт",
)
async def patch_product(
    product_id: int,
    name: str = Form(..., min_length=1, max_length=20),
    price: Decimal = Form(..., ge=0),
    product_url: str = Form(..., alias="productUrl"),
    image: Optional[UploadFile] = File(None, description="Новое изображение"),
    db: AsyncSession = Depends(get_db),
):
    """Обновление записи; файл изображения необязателен."""
    image_content = None
    content_type = None
    if image is not None and image.filename:
        image_content, content_type = await read_image_upload(image)

    payload = ProductUpdate.model_validate(
        {"name": name, "price": price, "productUrl": product_url}
    )
    product = await update_product(
        db,
        product_id,
        payload,
        image_content=image_content,
        content_type=content_type,
    )
    return to_product_response(product)


@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Удалить продукт",
    description="Физическое удаление продукта и изображения из базы данных.",
)
async def remove_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Безвозвратное удаление продукта."""
    await delete_product(db, product_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
