# RFFM Render (Vercel)

Pequeña función serverless que PRERENDERIZA (con Chromium headless) la página de clasificaciones de la RFFM y devuelve el HTML de la tabla.

## Deploy rápido
1. Crea un proyecto en Vercel y sube estos archivos.
2. `vercel deploy` o importación desde GitHub.
3. Instala dependencias: `@sparticuz/chromium` y `puppeteer-core` (ya en package.json).
4. Endpoint quedará como: `https://TU-PROYECTO.vercel.app/api/rffm-render`.

## Uso
GET `/api/rffm-render?target=<URL>&selector=<css>&table_hint=PTS`

Devuelve JSON:
```json
{ "html": "<table>...</table>" }
```

## En WordPress
En el shortcode del plugin:
```
[rffm_clasificacion ... renderer="https://TU-PROYECTO.vercel.app/api/rffm-render"]
```

Opcional:
- `selector=` para elegir el nodo exacto si lo conoces.
- `table_hint=` para afinar la búsqueda ("PTS", "Ptos", "Puntos"...).
