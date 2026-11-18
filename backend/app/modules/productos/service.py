from app.modules.productos.models import Producto
from app.modules.productos.schemas import ProductoCreate, ProductoRead, ProductoStockUpdate, ProductosPaginados, ProductoUpdate
from app.modules.productos.unit_of_work import ProductoUnitOfWork

class ProductoNoEncontrado(Exception):
    pass

class CategoriaNoEncontrada(Exception):
    pass

class ProductoService:
    def listar(
        self,
        skip: int,
        limit: int,
        search: str | None,
        categoria_id: int | None,
        disponible: bool | None,
    ) -> ProductosPaginados:
        with ProductoUnitOfWork() as uow:
            productos, total = uow.productos.search(skip, limit, search, categoria_id, disponible)
            items = [ProductoRead.model_validate(producto) for producto in productos]
            return ProductosPaginados(total=total, items=items)

    def obtener(self, producto_id: int) -> ProductoRead:
        with ProductoUnitOfWork() as uow:
            producto = uow.productos.get_by_id(producto_id)
            if producto is None or not producto.activo:
                raise ProductoNoEncontrado("producto no encontrado")
            return ProductoRead.model_validate(producto)

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with ProductoUnitOfWork() as uow:
            categoria = uow.categorias.get_by_id(data.categoria_id)
            if categoria is None or not categoria.activo:
                raise CategoriaNoEncontrada("categoria no encontrada")
            producto = Producto.model_validate(data)
            producto.categoria = categoria
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def actualizar(self, producto_id: int, data: ProductoUpdate) -> ProductoRead:
        with ProductoUnitOfWork() as uow:
            producto = uow.productos.get_by_id(producto_id)
            if producto is None or not producto.activo:
                raise ProductoNoEncontrado("producto no encontrado")
            cambios = {
                campo: valor
                for campo, valor in data.model_dump(exclude_unset=True).items()
                if valor is not None
            }
            if "categoria_id" in cambios:
                categoria = uow.categorias.get_by_id(cambios["categoria_id"])
                if categoria is None or not categoria.activo:
                    raise CategoriaNoEncontrada("categoria no encontrada")
                producto.categoria = categoria
            for campo, valor in cambios.items():
                setattr(producto, campo, valor)
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def actualizar_stock(self, producto_id: int, data: ProductoStockUpdate) -> ProductoRead:
        with ProductoUnitOfWork() as uow:
            producto = uow.productos.get_by_id(producto_id)
            if producto is None or not producto.activo:
                raise ProductoNoEncontrado("producto no encontrado")
            producto.stock = data.stock
            producto.disponible = data.disponible
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def eliminar(self, producto_id: int) -> None:
        with ProductoUnitOfWork() as uow:
            producto = uow.productos.get_by_id(producto_id)
            if producto is None or not producto.activo:
                raise ProductoNoEncontrado("producto no encontrado")
            producto.activo = False
            uow.productos.add(producto)