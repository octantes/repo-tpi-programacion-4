from sqlalchemy import func
from sqlmodel import Session, col, select
from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto

class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def search(
        self,
        skip: int,
        limit: int,
        search: str | None,
        categoria_id: int | None,
        disponible: bool | None,
        only_active: bool = True,
    ) -> tuple[list[Producto], int]:
        conditions = []
        if only_active:
            conditions.append(Producto.activo == True)
        if search:
            conditions.append(col(Producto.nombre).ilike(f"%{search}%"))
        if categoria_id is not None:
            conditions.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            conditions.append(Producto.disponible == disponible)
        statement = select(Producto).where(*conditions).order_by(Producto.nombre).offset(skip).limit(limit)
        count_statement = select(func.count(Producto.id)).where(*conditions)
        items = list(self.session.exec(statement).all())
        total = self.session.exec(count_statement).one()
        return items, int(total)