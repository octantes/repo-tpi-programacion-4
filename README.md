# food store - sistema de pedidos de comida

trabajo practico integrador de programacion 4. aplicacion web para un negocio de comidas con
backend fastapi + sqlmodel + postgresql y frontend react + typescript.

## funcionalidades

- registro publico, login con jwt en cookie httponly, logout y perfil de usuario.
- roles `user` y `admin` con rutas protegidas en el frontend y autorizacion real en el backend.
- catalogo de productos con busqueda, filtro por categoria y paginacion.
- carrito persistido en el navegador.
- checkout con direccion de entrega, forma de pago y notas.
- pedidos con maquina de estados: `PENDIENTE`, `EN_PREPARACION`, `ENTREGADO` y `CANCELADO`.
- descuento transaccional de stock al crear un pedido y restitucion al cancelarlo.
- copia del nombre y del precio del producto en cada linea del pedido.
- panel de administracion con resumen, categorias, productos, stock, pedidos y usuarios.
- baja logica de categorias, productos y usuarios. los pedidos no se eliminan.

## tecnologias

backend:

- python 3.13
- fastapi 0.116.1
- sqlmodel 0.0.24
- postgresql
- pydantic settings
- python-jose
- passlib con bcrypt

frontend:

- react 19
- typescript 5.9 con `strict: true`
- vite 7
- tanstack query 5
- tanstack form 1
- tanstack table 8
- zustand 5
- axios
- react router 7
- tailwind css 4

## requisitos

- python 3.13 o 3.12. no se recomienda python 3.14 por incompatibilidad con sqlmodel 0.0.24.
- node.js 20 o superior.
- pnpm 10 o superior.
- postgresql 15 o superior en ejecucion.

## estructura

```text
tpi-foodstore/
  backend/
    app/
      core/
      db/
      modules/
        auth/
        categorias/
        pedidos/
        productos/
        usuarios/
    requirements.txt
    .env.example
  frontend/
    src/
      features/
      routes/
      shared/
      store/
    package.json
    .env.example
  README.md
```

## variables de entorno

backend, archivo `backend/.env`:

| variable | descripcion | ejemplo |
| --- | --- | --- |
| `DATABASE_URL` | cadena de conexion a postgresql | `postgresql+psycopg2://postgres:postgres@127.0.0.1:5432/foodstore_db` |
| `SECRET_KEY` | clave usada para firmar el jwt | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | algoritmo de firma | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | duracion del token en minutos | `30` |
| `FRONTEND_ORIGIN` | origen permitido por cors con credenciales | `http://localhost:5173` |

frontend, archivo `frontend/.env`:

| variable | descripcion | ejemplo |
| --- | --- | --- |
| `VITE_API_URL` | url base de la api | `http://localhost:8000/api/v1` |

## base de datos

crear la base en postgresql:

```bash
createdb -h 127.0.0.1 -U postgres foodstore_db
```

tambien se puede crear desde `psql`:

```sql
create database foodstore_db;
```

el backend crea las tablas al iniciar. el seed es idempotente y se puede ejecutar varias veces.

## instalacion y ejecucion del backend

desde la raiz del proyecto:

```bash
cd backend
python3.13 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env
```

editar `backend/.env` con los datos reales de postgresql y una `SECRET_KEY` segura.

cargar el seed:

```bash
python -m app.db.seed
```

ejecutar el servidor:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

la api queda disponible en `http://localhost:8000/api/v1` y la documentacion en
`http://localhost:8000/docs` y `http://localhost:8000/redoc`.

## instalacion y ejecucion del frontend

desde la raiz del proyecto:

```bash
cd frontend
pnpm install
cp .env.example .env
pnpm dev
```

el frontend queda disponible en `http://localhost:5173`.

para verificar tipos y compilar:

```bash
pnpm build
```

para ejecutar el linter:

```bash
pnpm lint
```

## usuarios del seed

| rol | usuario | contraseña |
| --- | --- | --- |
| administrador | `admin` | `Admin1234!` |
| cliente | `cliente` | `Cliente1234!` |

el seed tambien carga cuatro categorias y doce productos con stock inicial.

## endpoints principales

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/token`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `GET /api/v1/categorias`
- `POST /api/v1/categorias`
- `PATCH /api/v1/categorias/{id}`
- `DELETE /api/v1/categorias/{id}`
- `GET /api/v1/productos`
- `POST /api/v1/productos`
- `PATCH /api/v1/productos/{id}`
- `PATCH /api/v1/productos/{id}/stock`
- `DELETE /api/v1/productos/{id}`
- `GET /api/v1/pedidos/mis-pedidos`
- `POST /api/v1/pedidos`
- `PATCH /api/v1/pedidos/{id}/estado`
- `PATCH /api/v1/pedidos/{id}/cancelar`
- `GET /api/v1/pedidos`
- `GET /api/v1/pedidos/resumen`
- `GET /api/v1/usuarios`
- `PATCH /api/v1/usuarios/{id}/estado`

## notas de implementacion

- el backend aplica el patron router, service, unit of work, repository y model.
- el unit of work hace commit, rollback y close en `__exit__`.
- el jwt viaja solo en la cookie httponly `access_token`. el frontend no lee ni guarda el token.
- `authStore` persiste solo el usuario. el token nunca se guarda en el navegador.
- `cartStore` persiste el carrito en el navegador.
- la sesion se valida con `checkSession` al montar la aplicacion. no se usan `fetch` dentro de `useEffect`.
- los pedidos usan transacciones para descontar y restituir stock de forma coherente.

## repositorio y video

- repositorio: https://github.com/octantes/repo-tpi-programacion-4
- video de demostracion: https://drive.google.com/file/d/1OiACv-YiuSHYX2pCP6kMb0OtGOSuoSMr/view?usp=sharing
