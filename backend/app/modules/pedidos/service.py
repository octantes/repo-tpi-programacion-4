from datetime import datetime, timezone
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import CambioEstado, PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.models import Usuario

class PedidoNoEncontrado(Exception):
    pass

class PedidoAjeno(Exception):
    pass

class ProductoNoEncontrado(Exception):
    pass

class ProductoNoDisponible(Exception):
    pass

class StockInsuficiente(Exception):
    pass

class ProductoRepetido(Exception):
    pass

class TransicionInvalida(Exception):
    pass

class PedidoService:
    TRANSICIONES = {
        "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
        "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
        "ENTREGADO": set(),
        "CANCELADO": set(),
    }

    def __init__(self) -> None:
        self.uow = PedidoUnitOfWork()

    def crear(self, usuario_id: int, data: PedidoCreate) -> PedidoRead:
        with self.uow as uow:
            producto_ids = [item.producto_id for item in data.items]
            if len(producto_ids) != len(set(producto_ids)):
                raise ProductoRepetido("no se permite repetir productos en el pedido")
            pedido = Pedido(
                usuario_id=usuario_id,
                estado="PENDIENTE",
                forma_pago=data.forma_pago,
                direccion_entrega=data.direccion_entrega,
                notas=data.notas,
                total=0,
            )
            uow.pedidos.add(pedido)
            detalles: list[DetallePedido] = []
            total = 0.0
            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(f"producto {item.producto_id} no encontrado")
                if not producto.disponible:
                    raise ProductoNoDisponible(f"el producto {producto.nombre} no esta disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(f"stock insuficiente para {producto.nombre}")
                producto.stock -= item.cantidad
                uow.productos.add(producto)
                subtotal = round(producto.precio_base * item.cantidad, 2)
                detalle = DetallePedido(
                    pedido_id=pedido.id,
                    producto_id=producto.id,
                    cantidad=item.cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=producto.precio_base,
                    subtotal=subtotal,
                )
                uow.session.add(detalle)
                detalles.append(detalle)
                total += subtotal
            pedido.total = round(total, 2)
            pedido.items = detalles
            uow.session.flush()
            return PedidoRead.model_validate(pedido)

    def listar(self, current_user: Usuario, skip: int, limit: int, estado: str | None) -> PedidosPaginados:
        with self.uow as uow:
            if current_user.role == "admin":
                pedidos, total = uow.pedidos.list_all(skip, limit, estado)
            else:
                pedidos, total = uow.pedidos.list_by_usuario(current_user.id or 0, skip, limit, estado)
            items = [PedidoRead.model_validate(pedido) for pedido in pedidos]
            return PedidosPaginados(total=total, items=items)

    def obtener(self, pedido_id: int, current_user: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado("pedido no encontrado")
            if current_user.role != "admin" and pedido.usuario_id != current_user.id:
                raise PedidoAjeno("el pedido pertenece a otro usuario")
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, pedido_id: int, data: CambioEstado) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado("pedido no encontrado")
            permitidos = self.TRANSICIONES.get(pedido.estado, set())
            if data.estado not in permitidos:
                raise TransicionInvalida(f"no se puede pasar de {pedido.estado.lower()} a {data.estado.lower()}")
            if data.estado == "CANCELADO":
                self._restituir_stock(uow, pedido)
            pedido.estado = data.estado
            pedido.updated_at = datetime.now(timezone.utc)
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    def cancelar(self, pedido_id: int, current_user: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado("pedido no encontrado")
            if pedido.usuario_id != current_user.id:
                raise PedidoAjeno("el pedido pertenece a otro usuario")
            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida("solo se puede cancelar un pedido pendiente")
            self._restituir_stock(uow, pedido)
            pedido.estado = "CANCELADO"
            pedido.updated_at = datetime.now(timezone.utc)
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            conteos = uow.pedidos.count_by_estado()
            return ResumenPedidos(
                pendientes=conteos.get("PENDIENTE", 0),
                en_preparacion=conteos.get("EN_PREPARACION", 0),
                entregados=conteos.get("ENTREGADO", 0),
                cancelados=conteos.get("CANCELADO", 0),
                pedidos_hoy=uow.pedidos.count_pedidos_hoy(),
                ingresos_entregados=uow.pedidos.sum_ingresos_entregados(),
            )

    def _restituir_stock(self, uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        for detalle in pedido.items:
            producto = uow.productos.get_by_id(detalle.producto_id)
            if producto is not None:
                producto.stock += detalle.cantidad
                uow.productos.add(producto)