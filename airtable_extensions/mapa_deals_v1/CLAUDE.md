# Extensión "Mapa de deals activos" — guía de trabajo

> Interface Extension custom de Airtable que pinta un mapa de España con la cartera viva de Advancing:
> **coropleta por provincia** (densidad de deals) + **puntos por código postal**, con **filtro por mes
> de cierre**. Todo el mapa es **SVG offline** (sin tiles, sin API key, sin red en runtime).

---

## Base y target

| | Valor |
|---|---|
| Base (Gestor de Operaciones) | `appuV5kGKzKdXlhoR` (token `advancing-gestor`) |
| Tabla | `deal` `tblwx73iceuKNaz68` (**500 campos** — suscribir solo `DEAL_FIELDS`) |
| "Deal activo" | `statusAplicable ∈ realizado` (10 / 5-renov / 12-ext / 4-flex) **y** `deal status ≠ TERMINADO` (contrato no vencido) — ~1.130 hoy |
| Acceso solo lectura | la extensión **solo lee** deals; no escribe nada |
| **Block publicado** | `blkwYK9ieC0QgUOsW` (baseId `NONE`, interface extension). Remote en `.block/remote.json` (gitignored) |

**Re-publicar** (HITL — pedir OK): el remote y la api key están en `.block/` y `.airtableblocksrc.json` (ambos gitignored). Si faltan (worktree nuevo), recrear:
```bash
block add-remote NONE/blkwYK9ieC0QgUOsW prod && cp .block/prod.remote.json .block/remote.json
block set-api-key <PAT con scope block:manage> --location app   # advancing-gestor sirve
block release    # pide un comentario por stdin: echo "..." | block release
```

Campos usados (todos lookup del inmueble salvo `deal status`/`statusAplicable`/`fechaCierre`), en [`frontend/lib/airtable.js`](frontend/lib/airtable.js):
`deal status`, `statusAplicable`, `CP inmueble`, `ciudad inmueble`, `provincia inmueble`, `direccion inmueble`, `mesCierre`, `fechaCierre`.

## Decisiones de producto (cerradas con el usuario)
- **Lienzo:** SVG vectorial offline (`d3-geo` + `topojson-client` + `d3-composite-projections`). Sin Mapbox/tiles.
- **Posición de cada deal:** centroide de su **CP** (tabla `CP→lat/lng` empaquetada). Fallback: centroide de provincia.
- **Activo (cartera):** `statusAplicable ∈ realizado` **y** `deal status ≠ TERMINADO`. El `deal status` temporal a secas (ABIERTO/EN TRAMITE) colaba cancelados, finalizados, caídas, pipeline y standby. **Mes de cierre:** filtro temporal (rango de meses).
- Join coropleta por **código INE de provincia = 2 primeros dígitos del CP** (no por el texto sucio de `provincia inmueble`).

## Stack
- **Airtable Blocks SDK** `@airtable/blocks@interface-alpha` (mismo que `gestor_deal_v1`).
- **React 19.1** + **Tailwind 3.4** (tokens de marca Advancing en `tailwind.config.js`, ver `design.md`).
- **Mapa:** `d3-geo` (geoPath), `topojson-client` (feature/mesh), `d3-composite-projections`
  (`geoConicConformalSpain` → inset de Canarias automático).
- Sin TypeScript ni tests. Punto de entrada `frontend/index.js` → `App.jsx`.

## Datos geográficos (offline, empaquetados en el bundle)
`frontend/geo/`:
- `provincias-es.json` — TopoJSON de provincias (es-atlas; `id` = código INE). ~58 KB.
- `cp-centroides.json` — `{cp: [lat,lng]}` de GeoNames ES (11.150 CPs, 98% cobertura sobre activos). ~278 KB.

Se regeneran con **`node scripts/build-geo.mjs`** (descarga es-atlas + GeoNames a `scripts/.cache/`,
requiere `unzip` en el PATH). Correr solo si hay que refrescar fuentes; los JSON ya están versionados.

## Arquitectura (`frontend/`)
- `lib/airtable.js` — constantes, `DEAL_FIELDS`, `first()`, `normCP()`, `closeYM()` (deriva mes de cierre).
- `lib/geo.js` — carga TopoJSON, proyección España, `cpLngLat()` / `provinceLngLat()`.
- `lib/scales.js` — escalas de color (coropleta) y radio (puntos, **absoluto**: área ∝ nº deals).
- `lib/deals.js` — `activeDeals()`, `monthRange()`, `filterByMonth()`, `aggregate()`.
- `components/` — `MapaEspana` (SVG), `Leyenda`, `FiltroMeses`, `PanelRanking`, `Tooltip` (createPortal).
- `App.jsx` — `useRecords(deal)` → filtra → estado de filtro de meses → `useMemo` agregados → layout.

## Preview local (iterar sin Airtable)

⚠️ **Este proyecto vive bajo `.claude/worktrees/`.** El MCP Claude Preview corre en un sandbox que
**prohíbe `getcwd()` bajo `.claude/`** → un `python -m http.server` normal peta (`PermissionError`).
Solución: servir una **copia desde `/tmp`** con un handler que use `directory=` absoluto.

```bash
npm run preview:build                                   # esbuild → preview/preview.bundle.js
# sincronizar a /tmp (la primera vez crea serve.py; ver más abajo) y recargar el preview MCP:
cp preview/index.html preview/preview.bundle.js /tmp/mapa_deals_www/
```
- `.claude/launch.json` (en el worktree) define el server `mapa-deals-preview` → `/tmp/mapa_deals_www/serve.py` (puerto 5052).
- `preview/mock-sdk.js` trae ~21 deals ficticios geolocalizados por toda España (varias provincias/CPs/meses + casos borde).
- Lo que se ve en el preview = lo que se publica (mismos componentes con el SDK mockeado).

> Para uso **fuera** de `.claude/` (p. ej. si se mueve la extensión), vale el `npm run preview:serve` clásico
> (puerto 5051, sirve la raíz y se accede por `/preview/`).

## Comandos
```bash
npm install                  # ANTES del primer block run/release (sobre todo en worktrees)
node scripts/build-geo.mjs   # regenerar assets geo (solo si hay que refrescar fuentes)
npm run lint                 # eslint (flat config en eslint.config.mjs)
npm run preview:build        # bundle del preview
npx block run                # dev server https://localhost:9000 (lee la base real, solo lectura)
npx block release            # publica nueva versión (HITL — ver abajo)
pkill -f "block run"         # parar dev server SIEMPRE antes de un release
```
Sanity Tailwind antes de release (debe ser ≥1, usar una clase realmente presente):
```bash
grep -c "bg-canvas" .tmp/bundle.js
```

## Trampas heredadas (de `gestor_deal_v1`, aplican aquí)
1. **Lookups multi-valor son arrays** → `CP inmueble`, `ciudad inmueble`… via `first()`.
2. **Fechas ES ≠ ISO**: `fechaCierre` viene ISO de Airtable (ok); el resto via `closeYM()`, nunca `new Date(textoES)`.
3. **`useRecords` con lista de `fields`** (500 campos en `deal`).
4. **Flotantes con `createPortal(document.body)`** (backdrop-filter rompe `position:fixed`) → `Tooltip`.
5. **Perf**: paths de provincia son constantes de módulo; fills/puntos en `useMemo`; `MapaEspana` es `React.memo`.
6. **`block release` sin `node_modules/` publica SIN Tailwind** → `npm install` antes; validar con el grep.

## ⚠️ Operaciones — REGLAS HITL (mismo contrato que `gestor_deal_v1`)
**Autónomas:** editar archivos, `git add`+`commit` local (sin push), refrescar schema, `build-geo`, `block run`/`pkill`, leer la base.
**HITL (anunciar y esperar OK):** `git push`, `npx block release`. La extensión es read-only, así que no hay escritura de datos.
**Commits:** Conventional Commits ligero en español, sujeto < 70 chars. Trailer `Co-Authored-By: Claude <noreply@anthropic.com>`.

## Estado
- ✅ **Publicada** (v0.0.1, block `blkwYK9ieC0QgUOsW`). Corre contra la base real (lee deals).
- ✅ Coropleta + puntos + inset Canarias + filtro por mes de cierre + tooltips + ranking + KPIs. Lint limpio.
- ✅ **Zoom/pan** (rueda, arrastre, encuadre por región) y **detalle adaptativo al zoom**: CCAA → provincia → municipio → CP,
  con etiqueta de recuento por nivel y **celdas Voronoi** de CP (d3-delaunay) al máximo zoom.
- ⏳ Por validar con datos reales: calidad del nivel municipio (agrupa por `ciudad inmueble`); rendimiento con ~miles de deals.
- Fuera de alcance (futuro): geocoding exacto por ref. catastral (escribir lat/lng), toggle a Mapbox, coropleta real de municipios, export.
