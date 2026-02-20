# Cancelacion de Rentas y Cashflows Futuros

Script de Airtable Automation para cancelar todas las rentas y cashflows futuros de un balance a partir de una fecha determinada. Si quedan meses de comision de servicio (Advancing) pendientes, genera una renta de saldo unica para cobrar el total de golpe.

---

## Caso de uso

Cuando un contrato de alquiler se cancela (fin anticipado, desistimiento, etc.), este script:
1. Pone a €0 el importe de todas las rentas futuras (todos los tipos)
2. Marca los cashflows como "Cancelado" y los pone a €0
3. Si habia meses de "Comision Advancing" pendientes, crea 1 renta + 1 cashflow In para cobrar el saldo de servicio restante de una sola vez

---

## Prerequisitos en Airtable

Crear estos campos/opciones **manualmente** en Airtable antes de configurar la automatizacion:

| # | Que crear | Donde | Tipo |
|---|-----------|-------|------|
| 1 | `fechaCancelacion` | tabla balance | Date |
| 2 | `avisoCancelacion` | tabla balance | Long text |
| 3 | Opcion "Cancelado" en `statusIns` | tabla cashflow | (agregar al select, color: grayLight1) |
| 4 | Opcion "Cancelado" en `statusOut` | tabla cashflow | (agregar al select, color: grayLight1) |

---

## Configuracion de la automatizacion

### Trigger

- **Tipo**: "When record matches conditions"
- **Tabla**: `balance`
- **Condicion**: `fechaCancelacion` is not empty

### Input variables

| Variable | Valor |
|----------|-------|
| `balanceRecordId` | Record ID del registro de balance (del trigger) |

### Action

- **Tipo**: "Run a script"
- **Script**: Copiar el contenido de `cancelarRentasFuturas.js`

---

## Que hace el script paso a paso

```
Balance (fechaCancelacion = 01/03/2025, precio = €800)
    │
    ├─ STEP 1: Lee el balance → fechaCancelacion, rentas vinculadas, precio actual
    │
    ├─ STEP 2: Filtra rentas vinculadas
    │           └─ fecha >= 01/03/2025
    │           └─ TODOS los tipos (Alquiler + Comision Advancing + otros)
    │
    ├─ STEP 3: Calcula saldo de servicio pendiente
    │           └─ Suma importeServicio de rentas tipo "Comision Advancing"
    │           └─ Ejemplo: 3 meses × €45.83 = €137.49
    │
    ├─ STEP 4: Pone importe de TODAS las rentas futuras → €0
    │           (batches de 50)
    │
    ├─ STEP 5: Recopila cashflows vinculados a esas rentas
    │
    ├─ STEP 6-7: Para cada cashflow con fechaProgramada >= fecha:
    │           └─ importe → €0
    │           └─ In: statusIns → "Cancelado"
    │           └─ Out: statusOut → "Cancelado"
    │           (batches de 50)
    │
    ├─ STEP 8: Si saldoServicio > 0:
    │           └─ Crea 1 renta "Comision Advancing" (fecha = fechaCancelacion)
    │           └─ Crea 1 cashflow In vinculado (Pendiente, importe = saldo)
    │
    └─ STEP 9: Escribe linea de auditoria en avisoCancelacion
```

---

## Logica del saldo de servicio

Cuando se cancela un contrato, las rentas de "Comision Advancing" futuras se ponen a €0. Pero ese servicio ya se ha prestado (gestion del contrato), asi que el script suma el `importeServicio` de esas rentas y crea un cobro unico:

```
Ejemplo: Contrato cancelado, quedan 3 meses de comision

  Renta Comision 03/2025: importeServicio = €45.83 → cancelada (€0)
  Renta Comision 04/2025: importeServicio = €45.83 → cancelada (€0)
  Renta Comision 05/2025: importeServicio = €45.83 → cancelada (€0)

  Saldo total: €137.49

  → Crea: 1 renta "Comision Advancing" (fecha: 01/03/2025, importeServicio: €137.49)
  → Crea: 1 cashflow In (Pendiente, importe: €137.49, razon: Renta, sujeto: Pagador alquiler)
```

Si `saldoServicio = 0`, no se crea nada adicional.

---

## Campos afectados por tabla

### Tabla `balance` (tblYNdOLuMvpBavEu)

| Campo | Field ID | Accion |
|-------|----------|--------|
| fechaCancelacion | _(nombre)_ | Lee (trigger) |
| avisoCancelacion | _(nombre)_ | Escribe log |
| linkMeses | fldFlp2wDVWljyTtC | Lee rentas vinculadas |
| importe | fldtJw4GfIzEtc7h2 | Lee (precio actual, para auditoria) |

### Tabla `rentas` (tbl2izIaOR37sRHGg)

| Campo | Field ID | Accion |
|-------|----------|--------|
| fecha | fldSdtfW7UfIw8z4V | Lee (para filtrar) |
| tipo | fldTWeJAYDxWOZWPJ | Lee (para detectar "Comision Advancing") |
| importe | fld2DbSB516n1bU8f | Actualiza a €0 |
| importeServicio | fldS4Zqn2KLOox9jG | Lee (para calcular saldo) |
| linkCashflows | fld7ERQvv5apIJcyX | Lee (para navegar a cashflows) |
| dealBalance | fldfh0vDzeqRuTFFE | Escribe (al crear renta de saldo) |

### Tabla `cashflow` (tblxY6upsLDmqzaaL)

| Campo | Field ID | Accion |
|-------|----------|--------|
| direccion | fld656RBx2XkCHzR7 | Lee (In/Out) + escribe (al crear) |
| fechaProgramada | fldrquziQqJoTn08B | Lee (para filtrar) + escribe (al crear) |
| importe | fldbkCQZwDR8a9kRP | Actualiza a €0 + escribe (al crear saldo) |
| statusIns | fldFyfq8PaqbCRgeN | Actualiza a "Cancelado" + escribe "Pendiente" (al crear) |
| statusOut | fldIMh0gNEA3TuaiG | Actualiza a "Cancelado" |
| linkRenta | fldsTJCCfItHDoCgS | Escribe (al crear cashflow de saldo) |
| linkDealBalance | fldyCWFzrTMhWs7FT | Escribe (al crear cashflow de saldo) |
| razon | fld17mZxxLYPQfUzr | Escribe "Renta" (al crear cashflow de saldo) |
| sujeto | fldazRk0SXXdqQo9L | Escribe "Pagador alquiler" (al crear cashflow de saldo) |

---

## Protecciones

- **Cancela TODOS los tipos de renta**: A diferencia de actualizarPrecio (solo Alquiler), este script cancela todas: Alquiler, Comision Advancing, etc.
- **No toca rentas pasadas**: Solo filtra rentas con `fecha >= fechaCancelacion`.
- **No toca cashflows pasados**: Solo filtra cashflows con `fechaProgramada >= fechaCancelacion`.
- **Saldo de servicio inteligente**: Solo crea la renta/cashflow de saldo si `saldoServicio > 0`.
- **Auditoria acumulativa**: Cada ejecucion append una linea al campo `avisoCancelacion`, nunca sobreescribe.

---

## Ejemplo de linea de auditoria

Sin saldo de servicio:
```
[12/02/2026 14:30] CANCELACION desde 01/03/2026 (precio era €800) — 10 rentas, 18 cashflows cancelados
```

Con saldo de servicio:
```
[12/02/2026 14:30] CANCELACION desde 01/03/2026 (precio era €800) — 10 rentas, 18 cashflows cancelados | Saldo servicio: €137.49 (3 meses comision → 1 renta + 1 cashflow In)
```

---

## Flujo visual

```
                    ┌─────────────────┐
                    │     BALANCE     │
                    │                 │
                    │ fechaCancelacion│──── trigger
                    └────────┬────────┘
                             │ linkMeses
                    ┌────────▼────────┐
                    │     RENTAS      │
                    │ (futuras, TODOS │
                    │  los tipos)     │
                    │                 │
                    │ importe → €0    │
                    └────────┬────────┘
                             │ linkCashflows
              ┌──────────────┼──────────────┐
     ┌────────▼────────┐           ┌────────▼────────┐
     │   CASHFLOW In   │           │  CASHFLOW Out   │
     │                 │           │                 │
     │ importe → €0    │           │ importe → €0    │
     │ statusIns →     │           │ statusOut →     │
     │  "Cancelado"    │           │  "Cancelado"    │
     └─────────────────┘           └─────────────────┘

     Si saldoServicio > 0:
              ┌──────────────────────────────┐
              │  NUEVA RENTA (Comision Adv.) │
              │  fecha = fechaCancelacion    │
              │  importeServicio = saldo     │
              └──────────────┬───────────────┘
                             │
              ┌──────────────▼───────────────┐
              │  NUEVO CASHFLOW In           │
              │  importe = saldo             │
              │  statusIns = "Pendiente"     │
              │  razon = "Renta"             │
              │  sujeto = "Pagador alquiler" │
              └──────────────────────────────┘
```

---

## Scripts relacionados

| Script | Funcion |
|--------|---------|
| `actualizarPrecioRentas.js` | Cambia el importe de rentas futuras y sus cashflows |
| **`cancelarRentasFuturas.js`** | Cancela rentas y cashflows futuros (importe → 0, status → Cancelado) |
| `cambiarSistemaPago.js` | Cambia el sistema de pago de Caixa a Unnax |
