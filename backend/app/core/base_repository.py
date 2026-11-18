from collections.abc import Callable
from typing import Generic, TypeVar
from sqlmodel import Session, SQLModel, select

T = TypeVar("T", bound=SQLModel)

class BaseRepository(Generic[T]):
    def __init__(self, session: Session, model: type[T]) -> None:
        self.session = session
        self.model = model

    def get_by_id(self, item_id: int) -> T | None:
        return self.session.get(self.model, item_id)

    def get_all(self, skip: int = 0, limit: int = 20) -> list[T]:
        statement = select(self.model).offset(skip).limit(limit)
        return list(self.session.exec(statement).all())

    def add(self, item: T) -> T:
        self.session.add(item)
        self.session.flush()
        return item

    def delete(self, item: T) -> None:
        self.session.delete(item)