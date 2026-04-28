# Sesion 28/04/2026 — Sync Bancos → Gestor (estadoBancario + precios)

## Contexto
Implementacion de la sincronizacion de campos operativos desde la base de Bancos (conciliacion) hacia el Gestor de Operaciones, usando two-way sync nativo de Airtable.

## Que se hizo

### 1. Campos creados manualmente en Airtable (sandbox bloqueaba API de schema)

**cashflow** (3 formulas):
- `esCobroPendiente`: `IF(AND({direccion} = "In", {statusIns} = "Pendiente"), 1, 0)`
- `esCobroDevuelto`: `IF(AND({direccion} = "In", OR({statusIns} = "Devuelta", {statusIns} = "Pago parcial")), 1, 0)`
- `esPagoPendiente`: `IF(AND({direccion} = "Out", {statusOut} = "Pendiente"), 1, 0)`

**balance** (3 rollups):
- `totalCobrosPendientes` → SUM(esCobroPendiente) via link cashflow
- `totalCobrosDevueltos` → SUM(esCobroDevuelto) via link cashflow
- `totalPagosPendientes` → SUM(esPagoPendiente) via link cashflow

**deals** (3 rollups + 1 formula + 1 select + 1 text):
- Rollups: `totalCobrosPendientes`, `totalCobrosDevueltos`, `totalPagosPendientes` via linkBalance
- `estadoBancario` (formula): Stop cobro > Con incidencias > Cobro pendiente > Pago pendiente > Al corriente
- `stopCobroInquilino` (singleSelect): To Do / In Progress / Done
- `historicoCambiosPrecios` (multilineText): `fld0HrIz7ZblScrqk`

**Gestor deal** (campos en two-way sync):
- `estadoBancario` (singleSelect): `fldDjs8jdDonwgh6W`
- `historicoCambiosPrecios` (multilineText): `fldvEH2HFKDEC6KsI`
- `stopCobroInquilino` ya existia: `fldWeJ1s7w64Taob4`

### 2. Script actualizarPrecioRentas.js — STEP 8 añadido
Tras actualizar rentas y cashflows, el script ahora:
1. Navega balance → linkDeal (`fldOnUYgysh29VHMe`) → deal
2. Escribe en el deal de Bancos:
   - `alquiler mensual` (`fldZE4Q0citWseonB`)
   - `historicoCambiosPrecios` (`fld0HrIz7ZblScrqk`)
3. El two-way sync propaga al Gestor automaticamente

### 3. Eliminacion de la automatizacion API
Se habia creado una automatizacion "Sync Bancos → Gestor" con script que llamaba a la API del Gestor con PAT. Se elimino porque:
- El usuario activo **two-way sync nativo de Airtable** para los 4 campos operativos
- Ya no se necesita API, PAT, ni prevencion de loops (_syncSource)

## Campos en Two-Way Sync (Bancos ↔ Gestor)

| Campo | Field ID Bancos | Field ID Gestor |
|-------|-----------------|-----------------|
| stopCobroInquilino | — | fldWeJ1s7w64Taob4 |
| estadoBancario | — (formula) | fldDjs8jdDonwgh6W |
| alquiler mensual | fldZE4Q0citWseonB | fldTJIw17zLdUiXDH |
| historicoCambiosPrecios | fld0HrIz7ZblScrqk | fldvEH2HFKDEC6KsI |

## Arquitectura final

```
Two-way sync nativo:  stopCobroInquilino, estadoBancario, alquiler mensual, historicoCambiosPrecios
Make scenarios:       Alta de deal (Gestor → Bancos), Poliza (Gestor → Bancos)
Automatizaciones AT:  actualizarPrecioRentas.js, cambiarSistemaPago.js, cancelarRentasFuturas.js
```

## Pendiente / Dudas abiertas

1. **Formula estadoBancario en balance**: El usuario queria una formula tambien en balance, no solo en deals. Se discutio la logica pero no se creo. La formula propuesta:
   ```
   IF(
     {totalCobrosDevueltos} > 0,
     "Con incidencias",
     IF(
       OR({totalCobrosPendientes} > 0, {totalPagosPendientes} > 0),
       "Pendiente",
       "Completado"
     )
   )
   ```
   Pendiente definir si necesita un estado "Al dia" diferente de "Completado".

2. **Trigger Make demasiado sensible**: Los webhooks de Airtable se disparan con cualquier cambio en la tabla deal del Gestor (495 campos). Opciones discutidas:
   - Usar "Watch Records" en Make (permite filtrar por campo)
   - Mover trigger a Airtable Automation que solo llame al webhook cuando cambian campos relevantes
   - Consolidar scenarios

3. **Two-way sync de formulas**: No se verifico si Airtable propaga campos formula via two-way sync. Si no funciona, habria que cambiar `estadoBancario` a un campo editable y usar una automatizacion que lo escriba cuando cambien los rollups.

## Commits
- `Add alquiler mensual to Bancos → Gestor sync`
- `Add historicoCambiosPrecios sync from Bancos to Gestor`
- `Simplify sync: use Airtable two-way sync instead of API calls`

## Branch
`claude/plan-airtable-sync-gS23w`
