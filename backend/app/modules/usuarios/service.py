from fastapi import HTTPException, status
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

class UsuarioService:
    def listar(self, skip: int, limit: int) -> list[UserPublic]:
        with UsuarioUnitOfWork() as uow:
            usuarios = uow.usuarios.get_all(skip, limit)
            return [UserPublic.model_validate(usuario) for usuario in usuarios]

    def activar(self, usuario_id: int) -> UserPublic:
        with UsuarioUnitOfWork() as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="usuario no encontrado")
            usuario.disabled = False
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

    def desactivar(self, usuario_id: int, current_user_id: int) -> UserPublic:
        if usuario_id == current_user_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="no puede desactivarse a si mismo")
        with UsuarioUnitOfWork() as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="usuario no encontrado")
            usuario.disabled = True
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)