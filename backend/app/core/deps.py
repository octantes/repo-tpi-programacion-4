from collections.abc import Callable
from fastapi import Cookie, Depends, HTTPException, status
from app.core.database import session_factory
from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario

def get_current_user(access_token: str | None = Cookie(default=None)) -> Usuario:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="sesion no valida",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not access_token:
        raise credentials_error
    subject = decode_access_token(access_token)
    if subject is None:
        raise credentials_error
    try:
        user_id = int(subject)
    except ValueError as exc:
        raise credentials_error from exc
    with session_factory() as session:
        user = session.get(Usuario, user_id)
    if user is None:
        raise credentials_error
    return user

def get_current_active_user(current_user: Usuario = Depends(get_current_user)) -> Usuario:
    if current_user.disabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="cuenta de usuario desactivada")
    return current_user

def require_role(allowed_roles: list[str]) -> Callable[[Usuario], Usuario]:
    def role_dependency(current_user: Usuario = Depends(get_current_active_user)) -> Usuario:
        if current_user.role not in allowed_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="no tiene permisos para esta accion")
        return current_user
    return role_dependency