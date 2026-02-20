# Actualizacion No Retroactiva de Precio de Rentas

Script de Airtable Automation para cambiar el precio del alquiler a partir de una fecha determinada, actualizando rentas futuras y sus cashflows asociados.

---

## Caso de uso

Cuando cambia el precio de un alquiler (ej. actualizacion IPC, renegociacion), este script actualiza el importe de todas las rentas tipo "Alquiler" futuras y recalcula los cashflows vinculados, respetando la comision de servicio (importeServicio) prorrateada de cada renta.

---

## Prerequisitos en Airtable

Los campos `nuevoPrecio`, `fechaNuevoPrecio` y `avisoNuevoPrecio` deben existir en la tabla `balance`. Si no existen, crearlos manualmente:

| Campo | Tipo | Field ID | Descripcion |
|-------|------|----------|-------------|
| `nuevoPrecio` | Number | fldiWklj6yoWqsQSH | Nuevo importe del alquiler |
| `fechaNuevoPrecio` | Date | fldMjSkNNd7J7BetK | Fecha desde la que aplicar el nuevo precio |
| `avisoNuevoPrecio` | Long text | fldaV2nYiekBXEHVz | Log de auditoria acumulativo (lo rellena el script) |

---

## Configuracion de la automatizacion

### Trigger

- **Tipo**: "When record matches conditions"
- **Tabla**: `balance`
- **Condicion**: `nuevoPrecio` is not empty AND `fechaNuevoPrecio` is not empty

### Input variables

| Variable | Valor |
|----------|-------|
| `balanceRecordId` | Record ID del registro de balance (del trigger) |

### Action

- **Tipo**: "Run a script"
- **Script**: Copiar el contenido de `actualizarPrecioRentas.js`

---

## Que hace el script paso a paso

```
Balance (nuevoPrecio = 850, fechaNuevoPrecio = 01/03/2025)
    │
    ├─ STEP 1: Lee el balance → nuevoPrecio, fechaNuevoPrecio, precio anterior
    │
    ├─ STEP 2: Filtra rentas vinculadas
    │           └─ tipo = "Alquiler" (ignora "Comision Advancing" y otros)
    │           └─ fecha >= 01/03/2025
    │
    ├─ STEP 3: Actualiza importe de esas rentas → €850
    │           (batches de 50)
    │
    ├─ STEP 4: Mapea cashflows vinculados a su renta padre
    │           (para obtener importeServicio de cada renta)
    │
    ├─ STEP 5-6: Para cada cashflow con fechaProgramada >= fecha:
    │           └─ In (cobro inquilino): nuevoPrecio + importeServicio
    │           └─ Out (pago propietario): nuevoPrecio (sin comision)
    │           (batches de 50)
    │
    └─ STEP 7: Escribe linea de auditoria en avisoNuevoPrecio
```

---

## Logica de importes en cashflows

El script respeta la comision de servicio prorrateada por renta:

```
Cashflow In (cobro al inquilino):
    nuevoImporte = nuevoPrecio + importeServicio de la renta
    Ejemplo: €850 + €45.83 = €895.83

Cashflow Out (pago al propietario):
    nuevoImporte = nuevoPrecio (sin comision)
    Ejemplo: €850
```

> **Nota**: La comision se gestiona mediante `importeServicio` en cada renta (puede estar prorrateada), NO con la comision global del deal.

---

## Campos afectados por tabla

### Tabla `balance` (tblYNdOLuMvpBavEu)

| Campo | Field ID | Accion |
|-------|----------|--------|
| nuevoPrecio | fldiWklj6yoWqsQSH | Lee (trigger) |
| fechaNuevoPrecio | fldMjSkNNd7J7BetK | Lee (trigger) |
| linkMeses | fldFlp2wDVWljyTtC | Lee rentas vinculadas |
| importe | fldtJw4GfIzEtc7h2 | Lee (precio anterior, para auditoria) |
| avisoNuevoPrecio | fldaV2nYiekBXEHVz | Escribe log |

### Tabla `rentas` (tbl2izIaOR37sRHGg)

| Campo | Field ID | Accion |
|-------|----------|--------|
| fecha | fldSdtfW7UfIw8z4V | Lee (para filtrar) |
| tipo | fldTWeJAYDxWOZWPJ | Lee (solo "Alquiler") |
| importe | fld2DbSB516n1bU8f | Actualiza a nuevoPrecio |
| importeServicio | fldS4Zqn2KLOox9jG | Lee (comision prorrateada) |
| linkCashflows | fld7ERQvv5apIJcyX | Lee (para navegar a cashflows) |

### Tabla `cashflow` (tblxY6upsLDmqzaaL)

| Campo | Field ID | Accion |
|-------|----------|--------|
| direccion | fld656RBx2XkCHzR7 | Lee (In/Out) |
| fechaProgramada | fldrquziQqJoTn08B | Lee (para filtrar) |
| importe | fldbkCQZwDR8a9kRP | Actualiza (nuevoPrecio +/- servicio) |

---

## Protecciones

- **Solo rentas tipo "Alquiler"**: Ignora rentas de "Comision Advancing", "DAS" y otros tipos.
- **No toca rentas pasadas**: Solo filtra rentas con `fecha >= fechaNuevoPrecio`.
- **No toca cashflows pasados**: Solo filtra cashflows con `fechaProgramada >= fechaNuevoPrecio`.
- **Respeta importeServicio individual**: Cada renta puede tener una comision prorrateada distinta. El cashflow In se calcula con la comision de SU renta, no una global.
- **Auditoria acumulativa**: Cada ejecucion append una linea al campo `avisoNuevoPrecio`, nunca sobreescribe.

---

## Ejemplo de linea de auditoria

```
[12/02/2026 14:30] €800 → €850 (efectivo desde 01/03/2026) — 10 rentas, 18 cashflows (9 In, 9 Out)
```

---

## Flujo visual

```
                    ┌─────────────────┐
                    │     BALANCE     │
                    │                 │
                    │ nuevoPrecio     │──── €850
                    │ fechaNuevoPrecio│──── trigger
                    └────────┬────────┘
                             │ linkMeses
                    ┌────────▼────────┐
                    │     RENTAS      │
                    │ (futuras tipo   │
                    │  "Alquiler")    │
                    │                 │
                    │ importe         │──── → €850
                    └────────┬────────┘
                             │ linkCashflows
              ┌──────────────┼──────────────┐
     ┌────────▼────────┐           ┌────────▼────────┐
     │   CASHFLOW In   │           │  CASHFLOW Out   │
     │ (cobro inq.)    │           │ (pago prop.)    │
     │                 │           │                 │
     │ importe =       │           │ importe =       │
     │ 850 + servicio  │           │ 850             │
     └─────────────────┘           └─────────────────┘
```

---

## Scripts relacionados

| Script | Funcion |
|--------|---------|
| **`actualizarPrecioRentas.js`** | Cambia el importe de rentas futuras y sus cashflows |
| `cancelarRentasFuturas.js` | Cancela rentas y cashflows futuros (importe → 0, status → Cancelado) |
| `cambiarSistemaPago.js` | Cambia el sistema de pago de Caixa a Unnax |
