from sqlalchemy import Engine
from sqlmodel import Session, SQLModel, create_engine
from app.core.config import settings

engine: Engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
session_factory = lambda: Session(engine)

def create_all_tables() -> None:
    from app.modules.categorias.models import Categoria
    from app.modules.pedidos.models import DetallePedido, Pedido
    from app.modules.productos.models import Producto
    from app.modules.usuarios.models import Usuario

    _ = (Usuario, Categoria, Producto, Pedido, DetallePedido)
    SQLModel.metadata.create_all(engine)