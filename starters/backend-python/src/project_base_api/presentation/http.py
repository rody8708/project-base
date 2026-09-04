# SPDX-FileCopyrightText: 2026 Zendrhax LLC
# SPDX-License-Identifier: MPL-2.0
import hashlib
import re
import time
import uuid
from collections.abc import Awaitable, Callable

from fastapi import Depends, FastAPI, Header, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.concurrency import run_in_threadpool
from starlette.exceptions import HTTPException as StarletteHttpException
from starlette.middleware.cors import CORSMiddleware

from project_base_api.application.errors import ApiError
from project_base_api.application.tasks import TaskService, task_dict
from project_base_api.domain.models import Principal
from project_base_api.domain.repositories import UnitOfWork

TOKEN_PATTERN = re.compile(r"^[0-9a-f]{64}$")
MESSAGES_ES = {
    "UNAUTHENTICATED": "Se requiere autenticación.",
    "FORBIDDEN": "La operación no está permitida.",
    "NOT_FOUND": "No se encontró el recurso.",
    "VALIDATION_FAILED": "Los valores proporcionados no cumplen el contrato.",
    "BAD_REQUEST": "Se requiere un objeto JSON válido.",
    "UNSUPPORTED_MEDIA_TYPE": "Content-Type debe ser application/json.",
    "PAYLOAD_TOO_LARGE": "El cuerpo de la solicitud es demasiado grande.",
    "VERSION_CONFLICT": "El recurso cambió; vuelve a cargarlo.",
    "METHOD_NOT_ALLOWED": "El método no está permitido.",
    "RATE_LIMITED": "Demasiadas solicitudes.",
    "INTERNAL_ERROR": "Ocurrió un error inesperado.",
}


def language(request: Request) -> str:
    return (
        "es-419" if request.headers.get("accept-language", "").lower().startswith("es") else "en-US"
    )


def create_app(
    uow_factory: Callable[[], UnitOfWork], allowed_origins: tuple[str, ...] = ()
) -> FastAPI:
    app = FastAPI(
        title="Foundation Tasks API", version="1.0.0-draft.2", docs_url=None, redoc_url=None
    )
    service = TaskService(uow_factory)

    def consume_rate(key: str, window: int) -> None:
        with uow_factory() as uow:
            if not uow.rates.consume(key, window, 120):
                raise ApiError(429, "RATE_LIMITED", "Too many requests.")

    if allowed_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=list(allowed_origins),
            allow_methods=["GET", "POST", "PUT", "DELETE"],
            allow_headers=[
                "Authorization",
                "Content-Type",
                "Accept-Language",
                "X-Request-Id",
            ],
            expose_headers=["X-Request-Id", "Location"],
            max_age=600,
        )

    @app.middleware("http")
    async def request_context(
        request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        request_id = request.headers.get("x-request-id", "")
        try:
            uuid.UUID(request_id)
        except ValueError:
            request_id = str(uuid.uuid4())
        try:
            if request.url.path.startswith("/api/v1/"):
                key = hashlib.sha256(
                    (request.client.host if request.client else "unknown").encode()
                ).hexdigest()
                await run_in_threadpool(consume_rate, key, int(time.time() // 60))
            response = await call_next(request)
        except ApiError as error:
            response = error_response(request, error)
        response.headers["X-Request-Id"] = request_id
        response.headers["Content-Language"] = language(request)
        response.headers["Cache-Control"] = "no-store"
        response.headers["X-Content-Type-Options"] = "nosniff"
        return response

    def principal(authorization: str | None = Header(default=None)) -> Principal:
        if not authorization or len(authorization) > 512 or not authorization.startswith("Bearer "):
            raise ApiError(401, "UNAUTHENTICATED", "Authentication is required.")
        token = authorization[7:]
        if not TOKEN_PATTERN.fullmatch(token):
            raise ApiError(401, "UNAUTHENTICATED", "Authentication is required.")
        with uow_factory() as uow:
            result = uow.tokens.find_principal(hashlib.sha256(token.encode()).hexdigest())
        if result is None:
            raise ApiError(401, "UNAUTHENTICATED", "Authentication is required.")
        return result

    @app.exception_handler(ApiError)
    async def handle_api_error(request: Request, error: ApiError) -> JSONResponse:
        return error_response(request, error)

    @app.exception_handler(RequestValidationError)
    async def handle_validation(request: Request, _error: RequestValidationError) -> JSONResponse:
        return error_response(
            request,
            ApiError(422, "VALIDATION_FAILED", "The request does not satisfy the contract."),
        )

    @app.exception_handler(StarletteHttpException)
    async def handle_http_error(request: Request, error: StarletteHttpException) -> JSONResponse:
        code = "METHOD_NOT_ALLOWED" if error.status_code == 405 else "NOT_FOUND"
        message = (
            "The method is not allowed."
            if error.status_code == 405
            else "The resource was not found."
        )
        response = error_response(request, ApiError(error.status_code, code, message))
        if error.status_code == 405 and error.headers and "Allow" in error.headers:
            response.headers["Allow"] = error.headers["Allow"]
        return response

    @app.exception_handler(Exception)
    async def handle_unexpected(request: Request, _error: Exception) -> JSONResponse:
        return error_response(
            request, ApiError(500, "INTERNAL_ERROR", "An unexpected error occurred.")
        )

    @app.get("/api/health")
    def health() -> dict[str, str]:
        return {"status": "ok", "scope": "liveness"}

    @app.get("/api/v1/auth/session")
    def session(current: Principal = Depends(principal)) -> dict[str, object]:
        return {"data": {"subject": current.subject, "permissions": current.permissions}}

    @app.delete("/api/v1/auth/token", status_code=204)
    def revoke(current: Principal = Depends(principal)) -> Response:
        with uow_factory() as uow:
            uow.tokens.revoke(current.token_id)
        return Response(status_code=204)

    @app.get("/api/v1/tasks")
    def list_tasks(
        request: Request,
        limit: int = 20,
        after: str | None = None,
        current: Principal = Depends(principal),
    ) -> dict[str, object]:
        keys = [key for key, _value in request.query_params.multi_items()]
        if any(key not in {"limit", "after"} for key in keys) or len(keys) != len(set(keys)):
            raise ApiError(422, "VALIDATION_FAILED", "The request does not satisfy the contract.")
        return service.list(current, limit, after)

    @app.post("/api/v1/tasks", status_code=201)
    async def create_task(
        request: Request, current: Principal = Depends(principal)
    ) -> JSONResponse:
        task = await run_in_threadpool(service.create, current, await json_object(request))
        return JSONResponse(
            {"data": task_dict(task)},
            status_code=201,
            headers={"Location": f"/api/v1/tasks/{task.id}"},
        )

    @app.get("/api/v1/tasks/{task_id}")
    def get_task(task_id: str, current: Principal = Depends(principal)) -> dict[str, object]:
        return {"data": task_dict(service.get(current, task_id))}

    @app.put("/api/v1/tasks/{task_id}")
    async def replace_task(
        task_id: str, request: Request, current: Principal = Depends(principal)
    ) -> dict[str, object]:
        task = await run_in_threadpool(
            service.replace, current, task_id, await json_object(request)
        )
        return {"data": task_dict(task)}

    @app.delete("/api/v1/tasks/{task_id}", status_code=204)
    async def delete_task(
        task_id: str, request: Request, current: Principal = Depends(principal)
    ) -> Response:
        await run_in_threadpool(service.delete, current, task_id, await json_object(request))
        return Response(status_code=204)

    return app


async def json_object(request: Request) -> dict[str, object]:
    if request.headers.get("content-type", "").split(";")[0].strip().lower() != "application/json":
        raise ApiError(415, "UNSUPPORTED_MEDIA_TYPE", "Content-Type must be application/json.")
    if len(await request.body()) > 8192:
        raise ApiError(413, "PAYLOAD_TOO_LARGE", "The request body is too large.")
    try:
        value = await request.json()
    except Exception as error:
        raise ApiError(400, "BAD_REQUEST", "A valid JSON object is required.") from error
    if not isinstance(value, dict):
        raise ApiError(400, "BAD_REQUEST", "A valid JSON object is required.")
    return value


def error_response(request: Request, error: ApiError) -> JSONResponse:
    message = (
        MESSAGES_ES.get(error.code, MESSAGES_ES["INTERNAL_ERROR"])
        if language(request) == "es-419"
        else str(error)
    )
    headers = {"WWW-Authenticate": "Bearer"} if error.status == 401 else {}
    if error.status == 429:
        headers["Retry-After"] = "60"
    return JSONResponse(
        {"error": {"code": error.code, "message": message}},
        status_code=error.status,
        headers=headers,
    )
