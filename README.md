# Bookstore Inventory API

API REST para la gestión del inventario de una cadena de librerías, con cálculo del precio de venta sugerido a partir de tasas de cambio en tiempo real.

El costo de los libros se registra en **dólares (USD)** y el precio de venta se calcula en **bolívares (VES)**, aplicando la tasa de cambio actual y un margen de ganancia del 40%.

## Tabla de contenido

- [Tecnologías](#tecnologías)
- [Arquitectura](#arquitectura)
- [Requisitos previos](#requisitos-previos)
- [Variables de entorno](#variables-de-entorno)
- [Instalación y ejecución con Docker (recomendado)](#instalación-y-ejecución-con-docker-recomendado)
- [Instalación y ejecución sin Docker](#instalación-y-ejecución-sin-docker)
- [Endpoints](#endpoints)
- [Ejemplos de uso](#ejemplos-de-uso)
- [Reglas de negocio](#reglas-de-negocio)
- [Manejo de errores](#manejo-de-errores)
- [Colección de Postman](#colección-de-postman)

## Tecnologías

- Python 3.13
- Django 6.1
- Django REST Framework 3.18
- django-cors-headers
- requests (consumo de la API de tasas de cambio)
- SQLite
- Docker y Docker Compose

## Arquitectura

El backend sigue una arquitectura por capas (hexagonal), separando la lógica de negocio del framework:

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

## Requisitos previos

**Con Docker (recomendado):**

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (incluye Docker Compose)
- Git

**Sin Docker:**

- Python 3.12 o superior (Django 6 no es compatible con versiones anteriores)
- pip
- Git

## Variables de entorno

El proyecto se configura con un archivo `.env` en la raíz del repositorio. Hay una plantilla en `.env.example`.

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

## Instalación y ejecución con Docker (recomendado)

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/victoriaparraf/bookstore-inventory-api.git
   cd bookstore-inventory-api
   ```

2. Crear el archivo `.env` a partir de la plantilla:

   ```bash
   # Linux / macOS / Git Bash
   cp .env.example .env

   # Windows PowerShell
   Copy-Item .env.example .env
   ```

3. Construir y levantar el contenedor:

   ```bash
   docker compose up --build
   ```

   Al arrancar, el contenedor aplica las migraciones automáticamente.

4. La API queda disponible en **http://localhost:8000**.

Comandos útiles:

```bash
# Detener el contenedor
docker compose down

# Crear un superusuario para el panel de administración
docker compose exec backend python manage.py createsuperuser
```

> Si el puerto 8000 ya está en uso, cambia el mapeo en `docker-compose.yml` (por ejemplo `"8001:8000"`) y usa http://localhost:8001.

## Instalación y ejecución sin Docker

1. Clonar el repositorio y entrar a la carpeta del backend:

   ```bash
   git clone https://github.com/victoriaparraf/bookstore-inventory-api.git
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

6. La API queda disponible en **http://localhost:8000**.

> Sin Docker, el archivo `.env` no se carga automáticamente y se usan los valores por defecto de la tabla de [variables de entorno](#variables-de-entorno). Para cambiarlos, define las variables en la terminal antes de ejecutar el servidor.

## Endpoints

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

## Ejemplos de uso

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

## Manejo de errores

Todos los errores devuelven el mismo formato JSON:

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

## Colección de Postman

La colección con todas las peticiones está en la carpeta [`postman/`](postman/).

Para usarla:

1. Abrir Postman y seleccionar **Import**.
2. Elegir el archivo `.json` de la carpeta `postman/`.
3. Con la API en marcha, ejecutar las peticiones.
