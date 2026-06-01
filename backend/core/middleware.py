from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from core.config import settings
from core.logger import logger


def _should_log_request_headers(path: str, method: str) -> bool:
    """Не логировать шумные GET-запросы картинок и служебные эндпоинты."""
    if path.endswith("/image"):
        return False
    if path in {"/api/health/", "/api/openapi.json"}:
        return False
    if method == "GET" and path.startswith("/swagger"):
        return False
    return True


class LogHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        """Логирование HTTP-запросов при включенной настройке LOG_HEADERS."""
        path = request.url.path
        if settings.LOG_HEADERS and _should_log_request_headers(path, request.method):
            logger.info("{} {}", request.method, path)
        response = await call_next(request)
        return response
