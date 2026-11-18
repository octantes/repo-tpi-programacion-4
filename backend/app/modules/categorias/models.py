from typing import List
from sqlmodel import Field, Relationship, SQLModel

class Categoria(SQLModel, table=True):
    __tablename__ = "categorias"

    id: int | None = Field(default=None, primary_key=True)
    nombre: str = Field(index=True, unique=True, min_length=2, max_length=100)
    descripcion: str = Field(default="", max_length=500)
    activo: bool = Field(default=True)
    productos: List["Producto"] = Relationship(back_populates="categoria")