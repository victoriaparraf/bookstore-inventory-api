import logging
from typing import Any, Optional
from django.db import IntegrityError
from django.http import JsonResponse
from rest_framework import exceptions, status
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler
from books.domain.exceptions import (
    BookAlreadyExistsError,
    BookNotFoundError,
    DomainError,
    ExchangeRateUnavailableError,
)

logger = logging.getLogger(__name__)


def build_error_body(
    status_code: int, error: str, message: str, details: Optional[Any] = None
) -> dict:
    return {
        "status": status_code,
        "error": error,
        "message": message,
        "details": details,
    }


def _error_response(
    status_code: int, error: str, message: str, details: Optional[Any] = None
) -> Response:
    return Response(build_error_body(status_code, error, message, details), status=status_code)


def _handle_domain_error(exc: DomainError) -> Response:
    if isinstance(exc, BookNotFoundError):
        return _error_response(status.HTTP_404_NOT_FOUND, "not_found", exc.message)

    if isinstance(exc, ExchangeRateUnavailableError):
        return _error_response(
            status.HTTP_503_SERVICE_UNAVAILABLE, "exchange_rate_unavailable", exc.message
        )

    error_code = "duplicate_isbn" if isinstance(exc, BookAlreadyExistsError) else "validation_error"
    details = {exc.field: [exc.message]} if exc.field else None
    return _error_response(status.HTTP_400_BAD_REQUEST, error_code, exc.message, details)


def custom_exception_handler(exc: Exception, context: dict) -> Response:
    if isinstance(exc, DomainError):
        return _handle_domain_error(exc)

    if isinstance(exc, IntegrityError):
        # Red de seguridad ante condiciones de carrera con la restricción unique del ISBN
        return _error_response(
            status.HTTP_400_BAD_REQUEST,
            "duplicate_isbn",
            "Ya existe un libro registrado con ese ISBN.",
            {"isbn": ["Ya existe un libro registrado con ese ISBN."]},
        )

    response = drf_exception_handler(exc, context)

    if response is not None:
        if isinstance(exc, exceptions.ValidationError):
            return _error_response(
                response.status_code,
                "validation_error",
                "Los datos enviados no son válidos.",
                response.data,
            )

        detail = response.data.get("detail") if isinstance(response.data, dict) else None
        error_code = getattr(exc, "default_code", "error")
        response.data = build_error_body(
            response.status_code, error_code, str(detail or exc)
        )
        return response

    # Error no controlado: se registra y se devuelve un 500 en JSON sin filtrar detalles internos
    logger.exception("Error no controlado en %s", context.get("view"))
    return _error_response(
        status.HTTP_500_INTERNAL_SERVER_ERROR,
        "internal_error",
        "Error interno del servidor.",
    )


def json_not_found_view(request, exception=None) -> JsonResponse:
    """Handler 404 de Django para rutas que no existen (fuera de las vistas DRF)"""
    return JsonResponse(
        build_error_body(404, "not_found", f"La ruta {request.path} no existe."), status=404
    )


def json_server_error_view(request) -> JsonResponse:
    """Handler 500 de Django para errores fuera de las vistas DRF"""
    return JsonResponse(
        build_error_body(500, "internal_error", "Error interno del servidor."), status=500
    )
