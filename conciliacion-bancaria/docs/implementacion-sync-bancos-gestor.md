# Implementación: Sync Bancos ↔ Gestor (Two-Way Sync de Airtable)

Los campos compartidos entre Bancos y Gestor se sincronizan mediante **two-way sync nativo de Airtable**. No se necesitan automatizaciones ni llamadas API para la sincronización de estos campos.

---

## Campos en Two-Way Sync

| Campo Bancos (deals) | Field ID Bancos | Campo Gestor (deal) | Field ID Gestor | Dirección principal |
|----------------------|-----------------|---------------------|-----------------|---------------------|
| `stopCobroInquilino` | — | `stopCobroInquilino` | `fldWeJ1s7w64Taob4` | Bancos → Gestor |
| `estadoBancario` | — | `estadoBancario` | `fldDjs8jdDonwgh6W` | Bancos → Gestor |
| `alquiler mensual` | `fldZE4Q0citWseonB` | `alquiler mensual` | `fldTJIw17zLdUiXDH` | Bancos → Gestor |
| `historicoCambiosPrecios` | `fld0HrIz7ZblScrqk` | `historicoCambiosPrecios` | `fldvEH2HFKDEC6KsI` | Bancos → Gestor |

> El two-way sync se encarga de propagar los cambios automáticamente. No se requiere `_syncSource` ni prevención de loops manual — Airtable lo gestiona internamente.

---

## Paso 1: Campos de apoyo para calcular `estadoBancario` en deals

Para que la fórmula `estadoBancario` pueda calcularse en deals, creamos **rollups encadenados** que agregan datos desde `balance → cashflow`.

### En tabla `cashflow`, crear campos auxiliares:

| Campo | Tipo | Fórmula |
|-------|------|---------|
| `esCobroPendiente` | formula | `IF(AND({direccion} = "In", {statusIns} = "Pendiente"), 1, 0)` |
| `esCobroDevuelto` | formula | `IF(AND({direccion} = "In", OR({statusIns} = "Devuelta", {statusIns} = "Pago parcial")), 1, 0)` |
| `esPagoPendiente` | formula | `IF(AND({direccion} = "Out", {statusOut} = "Pendiente"), 1, 0)` |

### En tabla `balance`, crear rollups:

| Campo | Tipo | Configuración |
|-------|------|---------------|
| `totalCobrosPendientes` | rollup | Link: cashflows → SUM(`esCobroPendiente`) |
| `totalCobrosDevueltos` | rollup | Link: cashflows → SUM(`esCobroDevuelto`) |
| `totalPagosPendientes` | rollup | Link: cashflows → SUM(`esPagoPendiente`) |

### En tabla `deals`, crear rollups finales:

| Campo | Tipo | Configuración |
|-------|------|---------------|
| `totalCobrosPendientes` | rollup | Link: `linkBalance` → SUM(`totalCobrosPendientes`) |
| `totalCobrosDevueltos` | rollup | Link: `linkBalance` → SUM(`totalCobrosDevueltos`) |
| `totalPagosPendientes` | rollup | Link: `linkBalance` → SUM(`totalPagosPendientes`) |

### En tabla `deals`, fórmula `estadoBancario`:

```
IF(
  {stopCobroInquilino} = "In Progress",
  "Stop cobro",
  IF(
    {totalCobrosDevueltos} > 0,
    "Con incidencias",
    IF(
      {totalCobrosPendientes} > 0,
      "Cobro pendiente",
      IF(
        {totalPagosPendientes} > 0,
        "Pago pendiente",
        "Al corriente"
      )
    )
  )
)
```

> **Prioridad de estados**: Stop cobro > Con incidencias > Cobro pendiente > Pago pendiente > Al corriente

---

## Paso 2: Sync de precios desde `actualizarPrecioRentas.js`

El script `actualizarPrecioRentas.js` (automatización en tabla `balance`) ya incluye un **STEP 8** que, tras actualizar rentas y cashflows:

1. Navega `balance → linkDeal` para encontrar el deal en Bancos
2. Escribe en el deal de Bancos:
   - `alquiler mensual` (`fldZE4Q0citWseonB`) ← el nuevo precio
   - `historicoCambiosPrecios` (`fld0HrIz7ZblScrqk`) ← contenido acumulado de `avisoNuevoPrecio`
3. El **two-way sync** propaga automáticamente estos valores al Gestor

> No se necesita PAT ni llamadas API — todo ocurre dentro de la misma base de Bancos.

---

## Paso 3: Verificación

1. **Test stopCobroInquilino**:
   - En Bancos, cambia `stopCobroInquilino` de un deal a "In Progress"
   - Verifica en Gestor que el mismo deal muestra "In Progress" (vía two-way sync)

2. **Test estadoBancario**:
   - En Bancos, marca un cashflow como "Devuelta"
   - Verifica que la fórmula `estadoBancario` en deals cambia a "Con incidencias"
   - Verifica que el campo `estadoBancario` en Gestor se actualiza (vía two-way sync)

3. **Test cambio de precio**:
   - En Bancos, rellena `nuevoPrecio` y `fechaNuevoPrecio` en un balance
   - Verifica que se ejecuta `actualizarPrecioRentas`
   - Verifica en Gestor que `alquiler mensual` tiene el nuevo precio
   - Verifica en Gestor que `historicoCambiosPrecios` tiene la línea de auditoría

4. **Test deal sin enlace**:
   - Verifica que balances sin `linkDeal` no disparan errores en el script

---

## Resumen de campos a crear

### cashflow (3 fórmulas)
- `esCobroPendiente`
- `esCobroDevuelto`
- `esPagoPendiente`

### balance (3 rollups)
- `totalCobrosPendientes`
- `totalCobrosDevueltos`
- `totalPagosPendientes`

### deals (4 campos: 3 rollups + 1 fórmula)
- `totalCobrosPendientes` (rollup)
- `totalCobrosDevueltos` (rollup)
- `totalPagosPendientes` (rollup)
- `estadoBancario` (fórmula)

> `stopCobroInquilino`, `alquiler mensual`, `historicoCambiosPrecios` ya existen en ambas bases vía two-way sync.

**Total: 10 campos nuevos de apoyo** (3 en cashflow, 3 en balance, 4 en deals)
