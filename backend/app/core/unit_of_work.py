from types import TracebackType
from sqlmodel import Session
from app.core.database import session_factory

class UnitOfWork:
    def __init__(self) -> None:
        self._session: Session | None = None

    @property
    def session(self) -> Session:
        if self._session is None:
            raise RuntimeError("la sesion no esta abierta")
        return self._session

    def __enter__(self) -> "UnitOfWork":
        self._session = session_factory()
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc_value: BaseException | None,
        traceback: TracebackType | None,
    ) -> bool:
        if self._session is None:
            return False
        try:
            if exc_type is None:
                self._session.commit()
            else:
                self._session.rollback()
        except Exception:
            self._session.rollback()
            raise
        finally:
            self._session.close()
            self._session = None
        return False