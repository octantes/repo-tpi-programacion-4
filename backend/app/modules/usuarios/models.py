from datetime import datetime, timezone
from typing import List
from sqlmodel import Field, Relationship, SQLModel

class Usuario(SQLModel, table=True):
    __tablename__ = "usuarios"

    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True, max_length=50)
    full_name: str = Field(max_length=150)
    email: str = Field(index=True, unique=True, max_length=200)
    hashed_password: str = Field(max_length=255)
    role: str = Field(default="user", max_length=20)
    disabled: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    pedidos: List["Pedido"] = Relationship(back_populates="usuario")