from fastapi import HTTPException, status
from app.core.security import create_access_token, hash_password, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

class AuthService:
    def register(self, data: UserCreate) -> UserPublic:
        with UsuarioUnitOfWork() as uow:
            if uow.usuarios.get_by_username(data.username) is not None:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="el username ya existe")
            if uow.usuarios.get_by_email(data.email) is not None:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="el email ya existe")
            usuario = Usuario(
                username=data.username,
                full_name=data.full_name,
                email=data.email,
                hashed_password=hash_password(data.password),
                role="user",
                disabled=False,
            )
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

    def login(self, username: str, password: str) -> str:
        with UsuarioUnitOfWork() as uow:
            usuario = uow.usuarios.get_by_username(username)
            if usuario is None or not verify_password(password, usuario.hashed_password):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="credenciales incorrectas",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            if usuario.disabled:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="cuenta de usuario desactivada")
            return create_access_token(str(usuario.id))