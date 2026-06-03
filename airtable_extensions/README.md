# Airtable Interface Extensions — Advancing

Extensions React custom para el Gestor de Operaciones de Advancing (base `appuV5kGKzKdXlhoR`).

## Sub-proyectos

| Carpeta | Propósito | Tabla principal | Estado |
|---------|-----------|-----------------|--------|
| `gestor_deal_v1/` | Replica la record review page de un deal (22 secciones) + panel de validación + disparo de docs/webhooks | `deal` (`tblwx73iceuKNaz68`) | Scaffold inicial. Inventario de la interfaz capturado en `docs/interface_spec.md`. |
| `mapa_deals_v1/` | Mapa de España de la cartera viva: coropleta por provincia + puntos por CP + filtro por mes de cierre. SVG offline (d3-geo/topojson), read-only | `deal` (`tblwx73iceuKNaz68`) | MVP funcional validado en preview. Pendiente `block run` contra base real + release. |

## Stack

- React 19.1 + Airtable Blocks SDK (`@airtable/blocks@interface-alpha`).
- Tailwind 3.4 con design tokens de Airtable (template oficial MIT-0).
- Build con `@airtable/blocks-cli` (`block run` / `block release`).

## Precedente

Patrón y trampas heredadas de la extension de facturación de Galiwonders
(`~/Desktop/2_nch/2_Galiwonders/3_documentos/airtable_extensions/facturacion_v_1`).
