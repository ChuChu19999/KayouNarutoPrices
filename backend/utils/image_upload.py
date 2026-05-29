from fastapi import UploadFile
from core.exceptions import ValidationError

ALLOWED_IMAGE_TYPES = frozenset({"image/jpeg", "image/png", "image/webp", "image/gif"})
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024


async def read_image_upload(file: UploadFile) -> tuple[bytes, str]:
    """Читает файл изображения из multipart и проверяет тип и размер."""
    content_type = (file.content_type or "").split(";")[0].strip().lower()
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise ValidationError("Допустимые форматы изображения: JPEG, PNG, WebP, GIF")

    content = await file.read()
    if not content:
        raise ValidationError("Файл изображения пустой")
    if len(content) > MAX_IMAGE_SIZE_BYTES:
        raise ValidationError("Размер изображения не должен превышать 5 МБ")

    return content, content_type
