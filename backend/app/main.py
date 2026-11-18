from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.database import create_all_tables
from app.core.text import normalizar_texto
from app.modules.auth.router import router as auth_router
from app.modules.categorias.router import router as categorias_router
from app.modules.pedidos.router import router as pedidos_router
from app.modules.productos.router import router as productos_router
from app.modules.usuarios.router import router as usuarios_router

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    _ = app
    create_all_tables()
    yield

app = FastAPI(title="food store api", version="1.0.0", lifespan=lifespan)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    _ = request
    detail = []
    for error in exc.errors():
        item = dict(error)
        item["msg"] = normalizar_texto(str(item.get("msg", "")))
        detail.append(item)
    return JSONResponse(status_code=422, content={"detail": jsonable_encoder(detail)})

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router, prefix="/api/v1")
app.include_router(usuarios_router, prefix="/api/v1")
app.include_router(categorias_router, prefix="/api/v1")
app.include_router(productos_router, prefix="/api/v1")
app.include_router(pedidos_router, prefix="/api/v1")

@app.get("/")
def health() -> dict[str, str]:
    return {"status": "ok"}