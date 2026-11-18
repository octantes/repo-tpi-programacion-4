from datetime import datetime, timedelta, timezone
from sqlalchemy import func
from sqlmodel import Session, select
from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido

class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def _listar(self, conditions, skip: int, limit: int) -> tuple[list[Pedido], int]:
        statement = (
            select(Pedido)
            .where(*conditions)
            .order_by(Pedido.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        count_statement = select(func.count(Pedido.id)).where(*conditions)
        items = list(self.session.exec(statement).all())
        total = self.session.exec(count_statement).one()
        return items, int(total)

    def list_by_usuario(
        self,
        usuario_id: int,
        skip: int,
        limit: int,
        estado: str | None,
    ) -> tuple[list[Pedido], int]:
        conditions = [Pedido.usuario_id == usuario_id]
        if estado is not None:
            conditions.append(Pedido.estado == estado)
        return self._listar(conditions, skip, limit)

    def list_all(
        self,
        skip: int,
        limit: int,
        estado: str | None,
    ) -> tuple[list[Pedido], int]:
        conditions = []
        if estado is not None:
            conditions.append(Pedido.estado == estado)
        return self._listar(conditions, skip, limit)

    def count_by_estado(self) -> dict[str, int]:
        statement = select(Pedido.estado, func.count(Pedido.id)).group_by(Pedido.estado)
        rows = self.session.exec(statement).all()
        return {estado: int(total) for estado, total in rows}

    def count_pedidos_hoy(self) -> int:
        now = datetime.now(timezone.utc)
        inicio = now.replace(hour=0, minute=0, second=0, microsecond=0)
        fin = inicio + timedelta(days=1)
        statement = select(func.count(Pedido.id)).where(
            Pedido.created_at >= inicio,
            Pedido.created_at < fin,
        )
        return int(self.session.exec(statement).one())

    def sum_ingresos_entregados(self) -> float:
        statement = select(func.coalesce(func.sum(Pedido.total), 0.0)).where(Pedido.estado == "ENTREGADO")
        return float(self.session.exec(statement).one())