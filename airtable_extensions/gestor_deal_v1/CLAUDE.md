# Extension "Gestor del deal" — guía de trabajo

> Interface Extension custom de Airtable que replica (y mejora) la record review page de un deal
> del Gestor de Operaciones de Advancing. Objetivo: reproducir toda la funcionalidad de la interfaz
> actual + panel de validación consolidado + disparo controlado de docs/webhooks.

---

## Base y target

| | Valor |
|---|---|
| Base (Gestor de Operaciones) | `appuV5kGKzKdXlhoR` (token `advancing-gestor`) |
| Tabla principal | `deal` `tblwx73iceuKNaz68` (**500 campos**) |
| Interfaz a replicar | record review page `pagbyyPyyYM2epGOK` (22 secciones, 97 widgets) |
| Base externa enlazada | Bancos-ADV `appuGDs3spnRAvc61` (conciliación) |

Inventario completo de la interfaz: [`docs/interface_spec.md`](docs/interface_spec.md).
Schema completo descargado: [`docs/airtable_schema_advancing_gestor.json`](docs/airtable_schema_advancing_gestor.json).

## Stack

- **Airtable Blocks SDK** `@airtable/blocks@interface-alpha` (Interface Extensions, beta).
- **React 19.1** con hooks.
- **Tailwind CSS 3.4** con design tokens de Airtable (`tailwind.config.js` copiado del template oficial).
- Sin TypeScript ni tests de momento.

Punto de entrada: `frontend/index.js` → `App.jsx`. Build con el CLI `@airtable/blocks-cli`.

## Preview local (iteración visual rápida, sin Airtable)

El modo desarrollo de Airtable (`block run` en `https://localhost:9000`) **no carga en el iframe**
porque Chrome no permite aceptar certificados autofirmados en subframes. Para iterar el diseño sin
publicar, hay un preview que reutiliza los **componentes reales** con un mock del SDK:

```bash
npm run preview:build        # compila preview/preview.bundle.js (esbuild, ~50ms)
npm run preview:serve        # sirve en http://127.0.0.1:5050/preview/ (HTTP plano, sin cert)
npm run preview:watch        # esbuild --watch (solo en terminal interactiva; en background pierde stdin y sale)
```

- `preview/mock-sdk.js`: mock de `@airtable/blocks/interface/ui` (useBase/useRecords/useSearchParams)
  con 2 deals ficticios (uno con incidencias, uno limpio). Editar aquí los datos de prueba.
- `preview/index.html`: Tailwind Play CDN con los MISMOS tokens que `tailwind.config.js`.
- Lo que se ve en el preview = lo que se publica (mismos componentes). Tras editar componentes,
  `npm run preview:build` y recargar el navegador.

## Comandos

```bash
npm install                  # ANTES del primer block run (sobre todo en worktrees, ver trampa #9)
npx block run                # dev server en https://localhost:9000
npx block release            # publica nueva versión (HITL — ver abajo)
pkill -f "block run"         # parar dev server SIEMPRE antes de un release
```

Sanity check Tailwind antes de release (debe ser ≥1). Usar una clase que SÍ esté en el código
actual (Tailwind solo compila las clases presentes; un sentinel no usado da 0 falsamente):
```bash
grep -c "bg-gray-gray50" .tmp/bundle.js
```

---

## Trampas heredadas de Galiwonders (aplican aquí)

1. **Label ≠ field name.** Las etiquetas de la interfaz son labels custom. Confirmar SIEMPRE el `fieldId`
   real en el editor / schema antes de tocar `getCellValue`. Aquí solo 4/48 labels coincidían.
2. **`getCellValue` vs `getCellValueAsString`**: para lookups multi-valor usar `getCellValue` (array).
3. **Fechas ES `D/M/YYYY` ≠ ISO**: nunca `new Date(string)` con valores del SDK; usar helper `parseDate`.
   Para presets de mes nunca `toISOString().slice(0,10)` (da fecha-1 en España) → `formatLocalISO`.
4. **`backdrop-filter` rompe `position: fixed`**: todo modal/menú flotante con `createPortal(node, document.body)`.
5. **`useRecords` con lista de fields**: con 500 campos, declarar `DEAL_FIELDS` mínimos y pasar `{fields}`.
6. **`useRecords` no acepta `null`**: tablas opcionales (inmueble, agencia) en subcomponente montado condicional.
7. **Performance**: `useDeferredValue`, `useMemo` para precompute, `React.memo` en filas, callbacks estables.
8. **Sticky thead vertical** no resuelto en puro CSS — no reintentar combinaciones de `overflow-*`.
9. **`block release` sin `node_modules/` publica bundle SIN Tailwind**: en worktree hacer `npm install`
   antes del primer `block run`/`release`. Validar con el grep de arriba. El release no falla aunque el CSS esté roto.
10. **`requestIdleCallback` no dispara fiable dentro del iframe**: trocear trabajo pesado con `setTimeout(fn,0)`,
    dep `[allRecords.length]` (no `[allRecords]`).

---

## ⚠️ Operaciones del repo — REGLAS HITL (obligatorias)

> Mismo contrato que Galiwonders, adaptado a Advancing. El `block release` afecta a producción
> (base `appuV5kGKzKdXlhoR`, equipo de operaciones de Advancing). NO hay base de staging conocida.

### Autónomas (sin pedir)
- Editar/crear/borrar archivos del proyecto.
- `git add` + `git commit` local (sin push).
- Refrescar schema vía API con token `advancing-gestor`.
- Arrancar/parar dev server (`block run` / `pkill`).
- Leer Airtable / explorar la interfaz con Chrome MCP.

### HITL (anunciar y esperar OK explícito)
1. `git push` a remoto.
2. `npx block release`.
3. Cualquier escritura sobre datos reales del deal (`updateRecords`) en pruebas — confirmar el deal de prueba.
4. Disparar webhooks de Make desde la extension contra registros reales.

**Regla 0**: si una operación tiene efecto externo y no está en la lista autónoma, es HITL.

### Plantilla de anuncio (antes de operación HITL)
```
🚨 Voy a [acción, lenguaje de operaciones].
📋 Qué incluye:
   • [cambio en español natural]
👥 Impacto para el equipo:
   [qué pasa al publicar/subir]
¿Adelante?
```

### Commits
Conventional Commits ligero en español, sujeto < 70 chars. Trailer cuando lo hace Claude:
```
Co-Authored-By: Claude <noreply@anthropic.com>
```

### Nunca commitear
Tokens/credenciales, `~/.claude/airtable_tokens.json`, `.env*`, `node_modules/`, `.tmp/`, `dist/`,
`.block/remote.json`.
