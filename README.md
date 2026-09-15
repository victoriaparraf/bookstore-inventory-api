# Bookstore Inventory

Sistema de gestión de inventario para una cadena de librerías, compuesto por:

- **API REST** (Django + Django REST Framework) con CRUD de libros, búsqueda, stock bajo y cálculo del precio de venta sugerido con tasas de cambio en tiempo real.
- **Interfaz web SPA** (React + TypeScript) que consume y gestiona todos los endpoints de la API.

El costo de los libros se registra en **dólares (USD)** y el precio de venta se calcula en **bolívares (VES)**, aplicando la tasa de cambio actual y un margen de ganancia del 40%.

## Tabla de contenido

- [Tecnologías](#tecnologías)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Arquitectura](#arquitectura)
- [Requisitos previos](#requisitos-previos)
- [Variables de entorno](#variables-de-entorno)
- [Instalación y ejecución con Docker (recomendado)](#instalación-y-ejecución-con-docker-recomendado)
- [Instalación y ejecución sin Docker](#instalación-y-ejecución-sin-docker)
- [Endpoints de la API](#endpoints-de-la-api)
- [Ejemplos de uso de la API](#ejemplos-de-uso-de-la-api)
- [Reglas de negocio](#reglas-de-negocio)
- [Manejo de errores](#manejo-de-errores)
- [Interfaz web (SPA)](#interfaz-web-spa)
- [Colección de Postman](#colección-de-postman)

## Tecnologías

**Backend**

- Python 3.13
- Django 6.1
- Django REST Framework 3.18
- django-cors-headers
- requests (consumo de la API de tasas de cambio)
- SQLite

**Frontend**

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- TanStack Query 5 (estado del servidor, caché y estados de carga)
- React Hook Form + Zod (formularios validados)
- Axios (cliente HTTP)
- Sonner (notificaciones toast)

**Infraestructura**

- Docker y Docker Compose

## Estructura del repositorio

```
bookstore-inventory-api/
├── backend/                 # API REST (Django)
├── frontend/                # Interfaz web SPA (React)
├── postman/                 # Colección de Postman exportada
├── docker-compose.yml       # Levanta backend y frontend juntos
├── .env.example             # Plantilla de variables de entorno del backend
└── README.md
```

## Arquitectura

Backend y frontend siguen una **arquitectura por capas**, separando las reglas de negocio de los frameworks.

### Backend

```
backend/
├── config/                    # Configuración de Django (settings, urls)
└── books/
    ├── domain/                # Reglas de negocio puras (sin Django)
    │   ├── book.py            # Entidad Book y sus validaciones
    │   ├── pricing.py         # Cálculo del precio de venta
    │   ├── exceptions.py      # Errores de dominio
    │   ├── repository.py      # Puerto del repositorio
    │   └── services.py        # Puerto del servicio de tasas de cambio
    ├── application/           # Casos de uso
    │   ├── book_service.py    # CRUD, búsqueda y stock bajo
    │   ├── pricing_service.py # Cálculo y guardado del precio
    │   └── dtos.py
    ├── infrastructure/        # Adaptadores (Django, API externa)
    │   ├── models.py          # Modelo ORM
    │   ├── repository.py      # Repositorio con Django ORM
    │   ├── exchange_rate.py   # Cliente de la API de tasas de cambio
    │   ├── mapper.py          # Serializers de DRF
    │   └── api/
    │       ├── controller.py  # Vistas
    │       ├── urls.py        # Rutas
    │       ├── exception.py   # Manejador global de errores
    │       └── pagination.py  # Paginación
    └── migrations/
```

### Frontend

```
frontend/src/
├── domain/                    # Tipos y reglas de negocio (TypeScript puro, sin React)
│   ├── book.ts                # Book, BookInput, filtros
│   ├── pagination.ts          # Respuesta paginada
│   ├── pricing.ts             # Resultado del cálculo de precio
│   ├── validation.ts          # ISBN, costo, stock, país
│   └── errors.ts              # AppError (400, 404, 500, 503, sin conexión)
├── application/               # Casos de uso (hooks de React Query)
│   ├── queryClient.ts         # Configuración global: reintentos y caché
│   └── books/
│       ├── useBookCatalog.ts  # Listado paginado + filtros
│       ├── useBook.ts         # Detalle de un libro
│       ├── useBookMutations.ts# Crear, editar, eliminar y calcular precio
│       ├── bookQueryKeys.ts   # Claves de caché
│       └── bookFormSchema.ts  # Validación del formulario (Zod)
├── infrastructure/            # Comunicación con la API
│   ├── http/
│   │   ├── httpClient.ts      # Axios + interceptor de errores
│   │   └── apiError.ts        # Convierte errores HTTP en AppError
│   └── books/
│       └── bookApi.ts         # Una función por endpoint
├── presentation/              # Interfaz de usuario
│   ├── components/            # Reutilizables: Button, Modal, ConfirmDialog, Pagination, Spinner...
│   ├── books/                 # BookTable, BookFilters, BookForm, BookDetailModal, PriceBreakdown...
│   ├── layout/                # AppLayout
│   ├── pages/                 # DashboardPage (vista única)
│   └── utils/                 # Formato de moneda y notificaciones
├── App.tsx                    # Providers (React Query, toasts)
└── main.tsx
```

**Manejo de errores en el frontend:** `bookApi` solo describe los endpoints. Axios rechaza cualquier respuesta no 2xx, el interceptor de `httpClient` convierte todos los errores en `AppError` en un único lugar, React Query los propaga como estado y la capa de presentación decide cómo mostrarlos (toast, error bajo el campo o vista de error con "Reintentar").

## Requisitos previos

**Con Docker (recomendado):**

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (incluye Docker Compose)
- Git

**Sin Docker:**

- Python 3.12 o superior (Django 6 no es compatible con versiones anteriores)
- Node.js 22 o superior y npm
- Git

## Variables de entorno

### Backend

Se configuran en un archivo `.env` en la raíz del repositorio. La plantilla está en `.env.example`.

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `DJANGO_SECRET_KEY` | Clave secreta de Django | `django-insecure-dev-only` |
| `DJANGO_DEBUG` | Modo depuración (`True` / `False`) | `True` |
| `DJANGO_ALLOWED_HOSTS` | Hosts permitidos, separados por coma | `localhost,127.0.0.1` |
| `EXCHANGE_RATE_API_URL` | API de tasas de cambio | `https://api.exchangerate-api.com/v4/latest/USD` |
| `EXCHANGE_RATE_TIMEOUT` | Tiempo máximo de espera de la API, en segundos | `5` |
| `LOCAL_CURRENCY` | Moneda de venta (código ISO 4217) | `VES` |
| `DEFAULT_EXCHANGE_RATE` | Tasa por defecto (VES por 1 USD) si la API falla | `842.21` |
| `PROFIT_MARGIN_PERCENTAGE` | Margen de ganancia | `40` |
| `CORS_ALLOWED_ORIGINS` | Orígenes permitidos para el frontend, separados por coma | `http://localhost:5173,http://localhost:3000` |

### Frontend

Se configura en `frontend/.env`. La plantilla está en `frontend/.env.example`.

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:8000` |

## Instalación y ejecución con Docker (recomendado)

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/victoriaparraf/bookstore-inventory-api.git
   cd bookstore-inventory-api
   ```

2. Crear los archivos de variables de entorno a partir de las plantillas:

   ```bash
   # Linux / macOS / Git Bash
   cp .env.example .env
   cp frontend/.env.example frontend/.env

   # Windows PowerShell
   Copy-Item .env.example .env
   Copy-Item frontend/.env.example frontend/.env
   ```

3. Construir y levantar los contenedores:

   ```bash
   docker compose up --build
   ```

   Al arrancar, el backend aplica las migraciones automáticamente.

4. Abrir la aplicación:

   - **Interfaz web:** http://localhost:5173
   - **API:** http://localhost:8000

Comandos útiles:

```bash
# Levantar en segundo plano
docker compose up -d --build

# Detener los contenedores
docker compose down

# Ver los logs
docker compose logs -f

# Crear un superusuario para el panel de administración (http://localhost:8000/admin)
docker compose exec backend python manage.py createsuperuser
```

> Si los puertos 8000 o 5173 ya están en uso, cambia el mapeo en `docker-compose.yml` (por ejemplo `"8001:8000"`). Si cambias el puerto del frontend, añádelo también a `CORS_ALLOWED_ORIGINS`; si cambias el de la API, actualiza `VITE_API_URL`.

## Instalación y ejecución sin Docker

### Backend

1. Entrar a la carpeta del backend:

   ```bash
   cd bookstore-inventory-api/backend
   ```

2. Crear y activar un entorno virtual:

   ```bash
   python -m venv venv

   # Windows PowerShell
   .\venv\Scripts\Activate.ps1

   # Linux / macOS
   source venv/bin/activate
   ```

3. Instalar las dependencias:

   ```bash
   pip install -r requirements.txt
   ```

4. Aplicar las migraciones:

   ```bash
   python manage.py migrate
   ```

5. Iniciar el servidor:

   ```bash
   python manage.py runserver
   ```

   La API queda disponible en **http://localhost:8000**.

> Sin Docker, el archivo `.env` no se carga automáticamente y se usan los valores por defecto de la tabla de [variables de entorno](#backend-1). Para cambiarlos, define las variables en la terminal antes de ejecutar el servidor.

### Frontend

En otra terminal, con el backend en marcha:

1. Entrar a la carpeta del frontend:

   ```bash
   cd bookstore-inventory-api/frontend
   ```

2. Crear el archivo de variables de entorno:

   ```bash
   # Linux / macOS / Git Bash
   cp .env.example .env

   # Windows PowerShell
   Copy-Item .env.example .env
   ```

3. Instalar las dependencias:

   ```bash
   npm install
   ```

4. Iniciar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   La interfaz queda disponible en **http://localhost:5173**.

Otros scripts disponibles:

```bash
npm run build   # Compila TypeScript y genera la versión de producción en dist/
npm run lint    # Revisa el código con ESLint
```

## Endpoints de la API

URL base: `http://localhost:8000`

> Las rutas **no** llevan barra final: `/books`, no `/books/`.

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/books` | Crear un libro |
| `GET` | `/books` | Listar libros (paginado) |
| `GET` | `/books/{id}` | Obtener un libro por ID |
| `PUT` | `/books/{id}` | Actualizar un libro |
| `DELETE` | `/books/{id}` | Eliminar un libro |
| `GET` | `/books/search?category={category}` | Buscar libros por categoría (paginado) |
| `GET` | `/books/low-stock?threshold={n}` | Libros con stock menor o igual al umbral (paginado, por defecto 10) |
| `POST` | `/books/{id}/calculate-price` | Calcular y guardar el precio de venta sugerido en VES |

**Paginación:** los listados aceptan `?page={n}` y `?page_size={n}` (por defecto 10, máximo 100).

## Ejemplos de uso de la API

### Crear un libro

```bash
curl -X POST http://localhost:8000/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "El Quijote",
    "author": "Miguel de Cervantes",
    "isbn": "978-84-376-0494-7",
    "cost_usd": 15.99,
    "stock_quantity": 25,
    "category": "Literatura Clásica",
    "supplier_country": "ES"
  }'
```

Respuesta `201 Created`:

```json
{
  "id": 1,
  "title": "El Quijote",
  "author": "Miguel de Cervantes",
  "isbn": "9788437604947",
  "cost_usd": 15.99,
  "selling_price_local": null,
  "stock_quantity": 25,
  "category": "Literatura Clásica",
  "supplier_country": "ES",
  "created_at": "2026-09-15T10:30:00.000000Z",
  "updated_at": "2026-09-15T10:30:00.000000Z"
}
```

> El ISBN se guarda sin guiones ni espacios.

### Listar libros

```bash
curl "http://localhost:8000/books?page=1&page_size=10"
```

Respuesta `200 OK`:

```json
{
  "count": 1,
  "total_pages": 1,
  "current_page": 1,
  "page_size": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "El Quijote",
      "author": "Miguel de Cervantes",
      "isbn": "9788437604947",
      "cost_usd": 15.99,
      "selling_price_local": null,
      "stock_quantity": 25,
      "category": "Literatura Clásica",
      "supplier_country": "ES",
      "created_at": "2026-09-15T10:30:00.000000Z",
      "updated_at": "2026-09-15T10:30:00.000000Z"
    }
  ]
}
```

### Obtener un libro por ID

```bash
curl http://localhost:8000/books/1
```

### Actualizar un libro

`PUT` reemplaza el recurso completo, así que se envían todos los campos editables:

```bash
curl -X PUT http://localhost:8000/books/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "El Quijote",
    "author": "Miguel de Cervantes",
    "isbn": "978-84-376-0494-7",
    "cost_usd": 18.50,
    "stock_quantity": 30,
    "category": "Literatura Clásica",
    "supplier_country": "ES"
  }'
```

> Si cambia `cost_usd`, `selling_price_local` vuelve a `null` para que se recalcule con el nuevo costo.

### Eliminar un libro

```bash
curl -X DELETE http://localhost:8000/books/1
```

Respuesta `204 No Content`.

### Buscar por categoría

La búsqueda no distingue mayúsculas de minúsculas.

```bash
curl "http://localhost:8000/books/search?category=literatura%20clásica"
```

### Libros con stock bajo

```bash
curl "http://localhost:8000/books/low-stock?threshold=10"
```

### Calcular el precio de venta

```bash
curl -X POST http://localhost:8000/books/1/calculate-price
```

Respuesta `200 OK`:

```json
{
  "book_id": 1,
  "cost_usd": 15.99,
  "exchange_rate": 842.21,
  "cost_local": 13466.94,
  "margin_percentage": 40,
  "selling_price_local": 18853.72,
  "currency": "VES",
  "rate_source": "live",
  "calculation_timestamp": "2026-09-15T10:30:00Z"
}
```

**Lógica del cálculo:**

1. Toma el `cost_usd` del libro.
2. Obtiene la tasa USD → VES de `https://api.exchangerate-api.com/v4/latest/USD`.
3. Calcula el costo local: `cost_local = cost_usd × exchange_rate`.
4. Aplica el margen del 40%: `selling_price_local = cost_local × 1.40`.
5. Guarda `selling_price_local` en la base de datos.
6. Devuelve el desglose del cálculo.

`rate_source` indica el origen de la tasa: `live` si viene de la API externa y `fallback` si la API falló y se usó `DEFAULT_EXCHANGE_RATE`. Los montos se redondean a 2 decimales.

## Reglas de negocio

- `cost_usd` debe ser mayor a 0.
- `stock_quantity` no puede ser negativo.
- `isbn` debe tener 10 o 13 dígitos. Se aceptan guiones y espacios, que se eliminan al guardar.
- No se permiten libros duplicados (mismo ISBN).
- `title`, `author` y `category` son obligatorios y no pueden estar vacíos.
- `supplier_country` debe ser un código de país de 2 letras (ISO 3166-1 alfa-2), por ejemplo `VE` o `ES`.
- Si la API de tasas de cambio falla, se usa la tasa por defecto `DEFAULT_EXCHANGE_RATE`.

Estas reglas se validan en el backend y también en los formularios del frontend antes de enviar la petición.

## Manejo de errores

Todos los errores de la API devuelven el mismo formato JSON:

```json
{
  "status": 400,
  "error": "duplicate_isbn",
  "message": "El ISBN 9788437604947 ya se encuentra registrado.",
  "details": {
    "isbn": ["El ISBN 9788437604947 ya se encuentra registrado."]
  }
}
```

| Código | `error` | Cuándo ocurre |
|---|---|---|
| `400` | `validation_error` | Datos inválidos (ISBN, costo, stock, campos vacíos, parámetros de búsqueda) |
| `400` | `duplicate_isbn` | Ya existe un libro con ese ISBN |
| `404` | `not_found` | El libro o la ruta no existe |
| `500` | `internal_error` | Error inesperado del servidor |
| `503` | `exchange_rate_unavailable` | No hay tasa de cambio disponible: falló la API externa y no hay tasa por defecto válida |

## Interfaz web (SPA)

Aplicación de **una sola página**: todas las acciones (detalle, creación, edición, confirmación de borrado y desglose del precio) ocurren en la misma vista mediante modales, sin recargar ni cambiar de página. Integra la totalidad de los endpoints de la API.

### Dashboard de inventario (listado y búsqueda)

- Catálogo de libros en una tabla con título, autor, ISBN, categoría, costo en USD, precio de venta en bolívares y stock.
- **Paginación** de resultados proveniente del backend (`GET /books?page=…&page_size=…`).
- **Panel de filtros**:
  - **Todos:** listado completo (`GET /books`).
  - **Por categoría:** búsqueda por categoría, sin distinguir mayúsculas (`GET /books/search`).
  - **Stock bajo:** libros con stock menor o igual a un umbral configurable (`GET /books/low-stock`). Los libros con stock bajo se resaltan en rojo.
- **Detalle del libro** en un modal (`GET /books/{id}`), abriéndolo desde el título o el botón **Ver**.

### Gestión de libros (creación, edición y eliminación)

- **Formularios validados** para crear (`POST /books`) y editar (`PUT /books/{id}`). Antes de enviar la petición se valida:
  - ISBN de 10 o 13 dígitos (se permiten guiones).
  - Costo mayor a 0 y con máximo 2 decimales.
  - Stock entero no negativo.
  - Título, autor y categoría obligatorios.
  - País proveedor de 2 letras.
- Los errores que devuelve el backend por campo (por ejemplo, ISBN duplicado) se muestran debajo del campo correspondiente.
- **Eliminación** (`DELETE /books/{id}`) con **modal de confirmación** para evitar borrados accidentales.

### Módulo de cálculo de precios (integración externa)

- Botón **Calcular precio** en cada fila del listado y **Calcular precio de venta** en el detalle del libro (`POST /books/{id}/calculate-price`).
- Muestra en tiempo real el **desglose del cálculo**: costo original (USD), tasa de cambio aplicada, costo en bolívares, margen de ganancia y precio de venta final en VES.
- Indica si la tasa es **en tiempo real** o la **tasa por defecto**, y avisa con una notificación cuando se usó la tasa por defecto.
- El nuevo precio se refleja al instante en el listado y en el detalle.

### Manejo de estados y errores

- **Indicadores de carga:** spinner en la carga inicial, indicador "Actualizando…" al cambiar de página o filtro, y spinner en los botones mientras se envía una petición (los botones se desactivan para evitar envíos duplicados).
- **Notificaciones (toasts)** de éxito al crear, editar, eliminar y calcular precios.
- **Notificaciones de error** con un título según el código devuelto por la API:

  | Código | Mensaje mostrado |
  |---|---|
  | `400` | Datos no válidos + detalle del error |
  | `404` | No encontrado |
  | `500` | Error del servidor |
  | `503` | Servicio no disponible |
  | Sin conexión | Sin conexión: verifica que el backend esté en marcha |

- Si falla la carga del listado, se muestra una vista de error con el botón **Reintentar**. Los errores temporales (sin conexión o 500) se reintentan automáticamente.
- Si un libro ya no existe (404, por ejemplo porque se eliminó desde otra pestaña), se cierra el modal abierto y el listado se actualiza.
- Estados vacíos cuando no hay libros o ningún libro coincide con el filtro.

## Colección de Postman

La colección con las peticiones a todos los endpoints está en [`postman/bookstore-inventory-api.postman_collection.json`](postman/bookstore-inventory-api.postman_collection.json).

Contiene tres carpetas:

- **CRUD:** crear, listar, listar paginado, obtener por ID, actualizar y eliminar.
- **Búsqueda:** por categoría, stock bajo con umbral y stock bajo con el umbral por defecto.
- **Cálculo Precio:** calcular el precio de venta.

Para usarla:

1. Abrir Postman y seleccionar **Import**.
2. Elegir el archivo `postman/bookstore-inventory-api.postman_collection.json`.
3. En la pestaña **Variables** de la colección, asignar `base_url` = `http://localhost:8000`.
4. Con la API en marcha, ejecutar las peticiones. Las que usan un ID en la URL (`/books/2`, `/books/3/calculate-price`) deben ajustarse al ID de un libro existente.
