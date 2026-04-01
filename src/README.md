# Estructura de `src` (alternativa ligera)

- **`App.tsx`**, **`main.tsx`**, **`index.css`**, **`config.ts`**: entrada y configuración de la app en la raíz de `src`.
- **`shared/timci/`**: plataforma reutilizable frente al API Timci (HTTP con sesión, URLs `/v1`, filtros de listado, errores de formulario, listas genéricas `TimciDataList`, códigos de permiso). **No** importa desde `features/`.
- **`shared/lib/`**: utilidades sin dominio Timci (p. ej. CSV, paginación de exportación).
- **`features/`**: pantallas y contexto por dominio (`users`, `tenants`, `preferences`, `change-password`, …). Puede importar `shared/timci/` y `shared/lib/`.
- **`app-shell/`**, **`providers/`**, **`i18n/`**: layout (cabecera, tenant, sider), providers Refine y textos de producto.

Regla de dependencias: `features` → `shared/timci` → `shared/lib`; `shared/timci` no depende de `features`.

## Accesibilidad (WCAG)

**Todo lo desarrollado bajo `src/` debe orientarse a cumplir el nivel A de WCAG 2.x** (controles con nombre accesible, formularios con instrucción o etiqueta, errores identificables, uso razonable con teclado, sin basar el significado solo en el color para lo esencial). Criterios y comprobaciones: [`.cursor/rules/timci-refine-frontend.mdc`](../.cursor/rules/timci-refine-frontend.mdc) (sección 9).
