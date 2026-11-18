from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core.config import settings
from app.core.deps import get_current_active_user
from app.modules.auth.service import AuthService
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import LoginResponse, UserCreate, UserPublic

router = APIRouter(prefix="/auth", tags=["auth"])

def get_auth_service() -> AuthService:
    return AuthService()

@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, service: AuthService = Depends(get_auth_service)) -> UserPublic:
    return service.register(data)

@router.post("/token", response_model=LoginResponse)
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    service: AuthService = Depends(get_auth_service),
) -> LoginResponse:
    token = service.login(form_data.username, form_data.password)
    response.set_cookie(
        key="access_token",
        value=token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True,
        secure=False,
        samesite="lax",
        path="/",
    )
    return LoginResponse(message="login exitoso")

@router.post("/logout", response_model=LoginResponse)
def logout(response: Response) -> LoginResponse:
    response.delete_cookie(key="access_token", path="/")
    return LoginResponse(message="sesion cerrada")

@router.get("/me", response_model=UserPublic)
def me(current_user: Usuario = Depends(get_current_active_user)) -> UserPublic:
    return UserPublic.model_validate(current_user)