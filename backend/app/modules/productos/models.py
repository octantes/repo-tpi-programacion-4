from typing import List, Optional
from sqlmodel import Field, Relationship, SQLModel

class Producto(SQLModel, table=True):
    __tablename__ = "productos"

    id: int | None = Field(default=None, primary_key=True)
    categoria_id: int = Field(foreign_key="categorias.id", index=True)
    nombre: str = Field(index=True, min_length=2, max_length=150)
    descripcion: str = Field(default="", max_length=500)
    precio_base: float = Field(default=0, ge=0)
    imagen_url: str = Field(default="", max_length=500)
    stock: int = Field(default=0, ge=0)
    disponible: bool = Field(default=True)
    activo: bool = Field(default=True)
    categoria: Optional["Categoria"] = Relationship(back_populates="productos")
    detalles: List["DetallePedido"] = Relationship(back_populates="producto")