from sqlmodel import Session, select
from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria

class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Categoria)

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        statement = select(Categoria).where(Categoria.nombre == nombre)
        return self.session.exec(statement).first()

    def get_all_active(self, skip: int = 0, limit: int = 100) -> list[Categoria]:
        statement = select(Categoria).where(Categoria.activo == True).order_by(Categoria.nombre).offset(skip).limit(limit)
        return list(self.session.exec(statement).all())