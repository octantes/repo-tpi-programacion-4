from sqlmodel import Session, select
from app.core.database import create_all_tables, engine
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

def seed_usuarios(session: Session) -> None:
    admin = session.exec(select(Usuario).where(Usuario.username == "admin")).first()
    if admin is None:
        session.add(
            Usuario(
                username="admin",
                full_name="administrador food store",
                email="admin@foodstore.com",
                hashed_password=hash_password("Admin1234!"),
                role="admin",
                disabled=False,
            )
        )
    cliente = session.exec(select(Usuario).where(Usuario.username == "cliente")).first()
    if cliente is None:
        session.add(
            Usuario(
                username="cliente",
                full_name="cliente demo",
                email="cliente@foodstore.com",
                hashed_password=hash_password("Cliente1234!"),
                role="user",
                disabled=False,
            )
        )
    session.commit()

def seed_categorias(session: Session) -> dict[str, int]:
    datos = [
        ("hamburguesas", "hamburguesas artesanales con papas"),
        ("pizzas", "pizzas al molde y a la piedra"),
        ("bebidas", "bebidas frias y sin alcohol"),
        ("postres", "opciones dulces para terminar"),
    ]
    for nombre, descripcion in datos:
        existente = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
        if existente is None:
            session.add(Categoria(nombre=nombre, descripcion=descripcion, activo=True))
    session.commit()
    categorias = session.exec(select(Categoria)).all()
    return {categoria.nombre: categoria.id or 0 for categoria in categorias}

def seed_productos(session: Session, categorias: dict[str, int]) -> None:
    datos = [
        ("hamburguesa clasica", "medallon de carne, queso, lechuga y tomate", 6500.0, 25, "hamburguesas", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80"),
        ("hamburguesa doble", "doble medallon, cheddar y cebolla caramelizada", 8900.0, 18, "hamburguesas", "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80"),
        ("hamburguesa vegetariana", "medallon de lentejas, palta y tomate", 7200.0, 12, "hamburguesas", "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=600&q=80"),
        ("pizza margarita", "masa artesanal, salsa, muzzarella y albahaca", 7800.0, 20, "pizzas", "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80"),
        ("pizza napolitana", "muzzarella, tomate y ajo", 8200.0, 15, "pizzas", "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80"),
        ("pizza especial", "muzzarella, jamon, morron y aceitunas", 9500.0, 10, "pizzas", "https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=600&q=80"),
        ("agua mineral", "botella de agua sin gas de 500 ml", 1500.0, 50, "bebidas", "https://images.unsplash.com/photo-1550505095-81378a674395?auto=format&fit=crop&w=600&q=80"),
        ("gaseosa cola", "botella de gaseosa de 1.5 litros", 2800.0, 40, "bebidas", "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=600&q=80"),
        ("limonada casera", "limonada con menta y hielo", 3200.0, 30, "bebidas", "https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?auto=format&fit=crop&w=600&q=80"),
        ("tiramisu", "postre italiano con cafe y mascarpone", 4500.0, 14, "postres", "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80"),
        ("cheesecake", "torta de queso con salsa de frutos rojos", 4800.0, 16, "postres", "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80"),
        ("brownie", "brownie de chocolate con nueces", 3800.0, 22, "postres", "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80"),
    ]
    for nombre, descripcion, precio, stock, categoria, imagen in datos:
        existente = session.exec(select(Producto).where(Producto.nombre == nombre)).first()
        if existente is None:
            session.add(
                Producto(
                    categoria_id=categorias[categoria],
                    nombre=nombre,
                    descripcion=descripcion,
                    precio_base=precio,
                    imagen_url=imagen,
                    stock=stock,
                    disponible=True,
                    activo=True,
                )
            )
    session.commit()

def run() -> None:
    create_all_tables()
    with Session(engine) as session:
        seed_usuarios(session)
        categorias = seed_categorias(session)
        seed_productos(session, categorias)
    print("seed completado")

if __name__ == "__main__":
    run()