from fastapi import APIRouter, Depends, Query
from app.core.deps import require_role
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService

router = APIRouter(prefix="/admin/usuarios", tags=["usuarios"])

def get_usuario_service() -> UsuarioService:
    return UsuarioService()

@router.get("", response_model=list[UserPublic])
def listar_usuarios(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
    service: UsuarioService = Depends(get_usuario_service),
    current_user: Usuario = Depends(require_role(["admin"])),
) -> list[UserPublic]:
    _ = current_user
    return service.listar(skip, limit)

@router.post("/{usuario_id}/activar", response_model=UserPublic)
def activar_usuario(
    usuario_id: int,
    service: UsuarioService = Depends(get_usuario_service),
    current_user: Usuario = Depends(require_role(["admin"])),
) -> UserPublic:
    _ = current_user
    return service.activar(usuario_id)

@router.post("/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar_usuario(
    usuario_id: int,
    service: UsuarioService = Depends(get_usuario_service),
    current_user: Usuario = Depends(require_role(["admin"])),
) -> UserPublic:
    return service.desactivar(usuario_id, current_user.id or 0)