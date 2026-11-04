import hmac
import logging

from fastapi import Header, HTTPException, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.core.config import get_settings

limiter = Limiter(key_func=get_remote_address, default_limits=[get_settings().rate_limit])


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "no-referrer")
        response.headers.setdefault("Permissions-Policy", "geolocation=(), camera=(), microphone=()")
        return response


def require_admin_token(x_admin_token: str = Header(default="")) -> None:
    expected = get_settings().admin_sync_token
    if not expected or not hmac.compare_digest(x_admin_token, expected):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token inválido")


def configure_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format='{"time":"%(asctime)s","level":"%(levelname)s","logger":"%(name)s","msg":"%(message)s"}',
    )
