from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork

class CategoriaNoEncontrada(Exception):
    pass

class NombreDuplicado(Exception):
    pass

class CategoriaService:
    def listar(self) -> list[CategoriaRead]:
        with CategoriaUnitOfWork() as uow:
            categorias = uow.categorias.get_all_active()
            return [CategoriaRead.model_validate(categoria) for categoria in categorias]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with CategoriaUnitOfWork() as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            if categoria is None or not categoria.activo:
                raise CategoriaNoEncontrada("categoria no encontrada")
            return CategoriaRead.model_validate(categoria)

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        with CategoriaUnitOfWork() as uow:
            if uow.categorias.get_by_nombre(data.nombre) is not None:
                raise NombreDuplicado("el nombre de la categoria ya existe")
            categoria = uow.categorias.add(Categoria.model_validate(data))
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        with CategoriaUnitOfWork() as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            if categoria is None or not categoria.activo:
                raise CategoriaNoEncontrada("categoria no encontrada")
            if data.nombre is not None and data.nombre != categoria.nombre:
                existente = uow.categorias.get_by_nombre(data.nombre)
                if existente is not None:
                    raise NombreDuplicado("el nombre de la categoria ya existe")
            cambios = data.model_dump(exclude_unset=True)
            for campo, valor in cambios.items():
                setattr(categoria, campo, valor)
            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, categoria_id: int) -> None:
        with CategoriaUnitOfWork() as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            if categoria is None or not categoria.activo:
                raise CategoriaNoEncontrada("categoria no encontrada")
            categoria.activo = False
            uow.categorias.add(categoria)