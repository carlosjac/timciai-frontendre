# Timci Admin — Refine + Ant Design

Admin alternativo para el [backend Timci](../backend): [Refine](https://refine.dev/) con **Ant Design**, mismo contrato que el admin principal en React Admin (`frontend`): cookie de sesión + `X-Use-Session`, listas con `sort` / `range` / `filter` en query y totales vía cabecera **`Content-Range`**.

## Requisitos

- Node.js 20+
- pnpm
- API en marcha (por defecto `http://127.0.0.1:3000`)

## Puesta en marcha

```bash
cp .env.example .env
pnpm install
pnpm dev
```

Abre **http://localhost:5174** (puerto distinto del Vite del admin React Admin en 5173).

## Configuración

| Variable | Uso |
|----------|-----|
| `VITE_API_URL` | En desarrollo suele ir vacío: Vite hace proxy de `/v1`, `/api` y `/health` al backend. En producción, origen público de la API (sin barra final); las peticiones van a `{VITE_API_URL}/v1/...`. |
| `VITE_BACKEND_PORT` | Solo dev: puerto del proxy (por defecto `3000`). Se carga en `vite.config.ts` con `loadEnv`. |
| `VITE_PROXY_TARGET` | Solo dev: URL completa del destino del proxy (p. ej. `http://127.0.0.1:3000`). Si está definida, sustituye host+puerto. |

### 502 Bad Gateway en `/v1/...` en dev

El navegador llama a `http://localhost:5174/v1/...` y Vite reenvía a la API. **502** suele ser **conexión rechazada** (API no levantada o host/puerto incorrecto).

1. Arranca el backend en el puerto de `VITE_BACKEND_PORT` (ver README de `backend`).
2. El proxy apunta por defecto a **`127.0.0.1`** para evitar `localhost` → `::1` cuando la API solo escucha IPv4.
3. En la consola de Vite puede aparecer un aviso si no hay nada escuchando en la URL de destino.
4. Otra máquina o Docker: define `VITE_PROXY_TARGET=http://host:puerto` en `.env` y reinicia Vite.

## Idioma

- **Interfaz:** español por defecto (`src/i18n/locale.es.ts`, `i18nProvider` de Refine, `ConfigProvider` de Ant Design con `es_ES`).
- **Código:** identificadores en inglés; textos visibles en el árbol de locale (ver `.cursor/rules/timci-refine-frontend.mdc`).

## Estructura de `src/`

| Ruta | Rol |
|------|-----|
| [`App.tsx`](src/App.tsx) | Refine, rutas, definición de `resources` (menú lateral). |
| [`config.ts`](src/config.ts) | Base `/v1`, claves de tenant en `localStorage`. |
| [`app-shell/`](src/app-shell/) | Cabecera, selector de tenant, menú de usuario, sider temático, redirección a la primera lista permitida. |
| [`features/`](src/features/) | Pantallas por dominio: listas (`*/list.tsx`), preferencias, cambio de contraseña. |
| [`providers/`](src/providers/) | `authProvider`, `accessControlProvider`, `timciDataProvider`. |
| [`shared/timci/`](src/shared/timci/) | Cliente HTTP, URLs por recurso, listas (`list/`), formularios y errores de API (`form/`, `i18n/`), `actionCodes`, `listQuery`, política de contraseña. |
| [`shared/lib/`](src/shared/lib/) | Utilidades puras (CSV, paginación para exportación). |
| [`i18n/`](src/i18n/) | Provider de Refine y mensajes en español. |

## Autenticación y tenant

- **Login:** `POST /v1/auth/login` con email/contraseña; sesión en cookie **HttpOnly** (igual que `frontend`).
- **Organización (tenant):** selector en la cabecera. Los listados bajo `/v1/tenants/:tenantId/...` **no cargan** hasta elegir tenant (prop `requiresTenant` en `TimciDataList`).

## Recursos y API

**Globales** (sin tenant en la ruta de API): usuarios, inquilinos, roles, acciones, **permisos**, **asignaciones usuario–tenant–rol** (`userTenantRoles`).

**Por tenant:** países, entidades, clientes, tipos de documento, monedas.

Rutas de lista en la app (ejemplos): `/users`, `/tenants`, `/roles`, `/actions`, `/user-tenant-roles`, `/permissions`, `/countries`, `/entities`, …

## Menú y permisos

La visibilidad de cada ítem del menú sigue los **mismos `actionCodes`** que el admin React Admin (`frontend/src/app/layout/Menu.tsx`): p. ej. `menu.countries`, `menu.assignments` (asignaciones), `menu.permissions`, etc. La lógica está en [`shared/timci/actionCodes.ts`](src/shared/timci/actionCodes.ts) (`canSeeResourceMenuItem`, `TIMCI_RESOURCE_LIST_ORDER`, `getFirstAccessibleListPath`) y el [`accessControlProvider`](src/providers/accessControlProvider.ts) consulta `GET /v1/authorization/me/action-codes`.

## Listados (`TimciDataList`)

Componente compartido en [`shared/timci/list/ui/TimciDataList.tsx`](src/shared/timci/list/ui/TimciDataList.tsx): visibilidad de columnas (persistida en `localStorage`), filtros por columna alineados con la API Timci, barra de filtros aplicados, exportación **CSV de todo el resultado** (todas las páginas), solo columnas visibles.

## Formularios con respuesta de servidor

Preferencias y cambio de contraseña usan alertas y mapeo de errores HTTP con [`shared/timci/form/`](src/shared/timci/form/) y traducciones en [`shared/timci/i18n/apiErrorTranslations.ts`](src/shared/timci/i18n/apiErrorTranslations.ts).

## Alcance actual

- Listados de solo lectura para los recursos registrados en `App.tsx`.
- Preferencias de usuario (zona horaria, formato de fecha, tema) y **cambio de contraseña**.
- Sin CRUD genérico en el data provider para create/update/delete de entidades de negocio (501 en esas operaciones salvo lo que se implemente aparte).

Ampliaciones (sesiones, edición en línea, más recursos) pueden seguir el mismo patrón: URL en [`apiUrl.ts`](src/shared/timci/apiUrl.ts), `fetchTimciListPage`, feature con `TimciDataList`, recurso y ruta en `App.tsx`, claves en `locale.es.ts` y caso en `canSeeResourceMenuItem` si el menú depende de un `menu.*` nuevo.

## Accesibilidad (orientación WCAG 2.x nivel A)

El código del admin intenta cubrir requisitos **A** básicos (etiquetas, nombres en iconos, landmarks donde aplica). No sustituye una auditoría formal.

**Comprobación manual recomendada** tras cambios en UI: iniciar sesión y recorrer login, una lista (filtros, columnas, exportar), cabecera (organización, menú de usuario) y preferencias **solo con teclado** (Tab, Enter, Escape). Opcional: extensiones tipo axe en el navegador en unas pocas rutas.

## Scripts

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor de desarrollo Vite (puerto 5174). |
| `pnpm build` | `tsc -b` + build de producción en `dist/`. |
| `pnpm preview` | Previsualizar el build. |
| `pnpm lint` | ESLint. |
