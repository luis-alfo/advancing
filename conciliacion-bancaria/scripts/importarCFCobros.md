# importarCFCobros.js — Importación de CF Cobros a Airtable

## Descripción

Script que lee las hojas **CF Cobros** y **Transferencia Propietario** del Excel `Hoja control - MES A MES.xlsx` y genera registros de cashflow (Cash In y Cash Out) para la tabla `cashflow` de Airtable.

## Uso

```bash
# Dry run (no envía datos, solo muestra lo que haría)
node scripts/importarCFCobros.js --dry-run

# Dry run para un mes específico
node scripts/importarCFCobros.js --dry-run --month=2025-03

# Importación real (requiere variables de entorno)
VITE_AIRTABLE_BASE_ID=appXXX AIRTABLE_TOKEN=patXXX node scripts/importarCFCobros.js

# Importación de un mes específico
VITE_AIRTABLE_BASE_ID=appXXX AIRTABLE_TOKEN=patXXX node scripts/importarCFCobros.js --month=2025-03
```

## Correcciones implementadas

### FIX #1: Devuelta en Cash In no propaga a Cash Out

**Problema:** Cuando en CF Cobros el estado del Cash In era "D" (Devuelta), el script marcaba también el Cash Out (pago al propietario) como "Devuelto".

**Solución:** El pago al propietario ocurre independientemente de la devolución SEPA del inquilino. Ahora:
- Cash In `D` → statusIns = `Devuelta`
- Cash Out correspondiente → statusOut = `Pendiente` (NO `Devuelto`)

El Cash Out solo se marca como `Devuelto` si el propio pago al propietario fue devuelto, lo cual se gestiona por un proceso separado.

### FIX #2: Operaciones sin gestión de cobro con SEPA propietario

**Problema:** Las operaciones donde `gestionCobro ≠ "SI"` y `pagador = "Propietario"` generaban tanto Cash In como Cash Out, cuando solo deberían generar Cash In.

**Solución:** Para estas operaciones:
- Se genera **solo un Cash In** con `sujeto = "Propietario"` y `metodoPago = "SEPA"`
- **No se genera Cash Out**, porque el propietario paga directamente a Advancing; no existe un pago separado al propietario.

## Mapeo de estados (Excel → Airtable)

| Excel | statusIns (Airtable)         |
|-------|------------------------------|
| c, C  | Cobrado                      |
| c', C'| Cobrada con retraso          |
| p, P  | Pendiente                    |
| d, D  | Devuelta                     |
| pp, PP| Pago parcial                 |
| r, R  | Recuperada vía arrendatario  |
| r', R'| Recuperada vía DAS           |
| DAS   | Recuperada vía DAS           |

## Estructura de datos

### CF Cobros (hoja Excel)
- Columnas fijas (0–34): Datos de la operación (nº operación, nombre, importe, concepto, etc.)
- Columnas mensuales (35+): Pares de (Importe, Estado) por cada mes

### Transferencia Propietario (hoja Excel)
- Col 0: Nº De Operación
- Col 5: Precio Advancing (%)
- Col 41: GESTIÓN COBROS ("SI", "Advancing", o vacío)
- Col 55: Pagador ("Propietario", "Inquilino", "Propietario/Inquilino")

### Tabla cashflow (Airtable)
- `direccion`: In / Out
- `statusIns`: Estado del cobro (solo para In)
- `statusOut`: Estado del pago (solo para Out)
- `importe`: Importe en €
- `fechaProgramada`: Fecha del mes
- `sujeto`: Pagador alquiler / DAS / Propietario
- `metodoPago`: SEPA / Transferencia / Tarjeta
- `razon`: Renta / Recobro / DAS
