# TP N.º 3 — Gestión de vehículos, conductores y viajes

Trabajo Práctico N.º 3 de **Programación IV** — Tecnicatura Universitaria en Programación, UTN Facultad Regional La Rioja.

Aplicación web para administrar los vehículos, conductores y viajes de una empresa de transporte, con autenticación mediante JWT.

## Tecnologías

- **Frontend:** React con Vite, React Router, CSS puro y `fetch`.
- **Backend:** Node.js, Express, `mysql2`, `express-validator`, Passport (`passport-jwt`) y `bcrypt`.
- **Base de datos:** MySQL 8 o superior.

## Estructura

```text
backend/
  database/schema.sql    Tablas y datos de ejemplo
  http/                  Archivos .http para probar la API
  src/                   Config, rutas, controladores, modelos y validaciones
frontend/
  src/                   Componentes, páginas, contexto y estilos
```

## Puesta en marcha

### 1. Base de datos

```bash
mysql -u root -p < backend/database/schema.sql
```

### 2. Backend

```bash
cd backend
copy .env.example .env     # En Linux/macOS: cp .env.example .env
npm install
npm run dev
```

Configurar en `.env`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=tp3_transporte
JWT_SECRET=un-secreto-largo-y-unico
JWT_EXPIRES=4h
CORS_ORIGIN=http://localhost:5173
```

La API queda en `http://localhost:3000/api`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

La aplicación queda en `http://localhost:5173`.

## Funcionalidades

- Registro e inicio de sesión con JWT (expira en 4 horas) y contraseñas encriptadas con bcrypt.
- CRUD de vehículos y conductores, disponible solo para usuarios autenticados.
- Registro, edición y eliminación de viajes asociando un vehículo y un conductor.
- Historial de viajes y total de kilómetros por vehículo o conductor.
- Validaciones con `express-validator` en el backend y en los formularios del frontend.
- Respuestas HTTP 400, 401, 404 y 500.
