# Cambio de Sistema de Pago (Configurable)

Script de Airtable Automation para migrar rentas y cashflows futuros de un sistema de pago a otro. Soporta cualquier combinacion: Caixa → Unnax, Unnax → Caixa, Manual → Unnax, etc.

---

## Caso de uso

Cuando un deal/balance necesita cambiar de sistema de cobro (ej. migrar de CaixaBank a Unnax, o viceversa), este script cambia el campo `sistemaPago` de todas las rentas y cashflows **futuros** de forma masiva, a partir de una fecha determinada.

El sistema de **origen se detecta automaticamente** de cada renta/cashflow (el que tenga en ese momento). El sistema de **destino se indica** en el campo `nuevoSistemaPago` del balance.

---

## Prerequisitos en Airtable

Crear estos 3 campos **manualmente** en la tabla `balance` antes de configurar la automatizacion:

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `fechaCambioSistema` | Date | Fecha a partir de la cual aplicar el cambio |
| `nuevoSistemaPago` | Single select (Unnax / Caixa / Manual) | Sistema de pago destino |
| `avisoCambioSistema` | Long text | Log de auditoria acumulativo (lo rellena el script) |

---

## Configuracion de la automatizacion

### Trigger

- **Tipo**: "When record matches conditions"
- **Tabla**: `balance`
- **Condicion**: `fechaCambioSistema` is not empty AND `nuevoSistemaPago` is not empty

### Input variables

| Variable | Valor |
|----------|-------|
| `balanceRecordId` | Record ID del registro de balance (del trigger) |

### Action

- **Tipo**: "Run a script"
- **Script**: Copiar el contenido de `cambiarSistemaPago.js`

---

## Que hace el script paso a paso

```
Balance (fechaCambioSistema = 01/03/2025, nuevoSistemaPago = "Unnax")
    │
    ├─ STEP 1: Lee el balance → fecha, sistema destino, sistema actual, rentas vinculadas
    │           Valida que destino ≠ actual (si son iguales, aborta)
    │
    ├─ STEP 2: Filtra rentas vinculadas
    │           └─ fecha >= 01/03/2025
    │           └─ sistemaPago ≠ destino (cualquier otro sistema)
    │           └─ Cuenta rentas por sistema de origen
    │
    ├─ STEP 3: Cambia sistemaPago de esas rentas → destino
    │           (batches de 50)
    │
    ├─ STEP 4: Recopila cashflows vinculados a esas rentas
    │
    ├─ STEP 5-6: Para cada cashflow:
    │           └─ fechaProgramada >= 01/03/2025
    │           └─ sistemaPago ≠ destino
    │           └─ estado "Pendiente" (statusIns o statusOut)
    │           └─ → Cambia sistemaPago al destino
    │           (batches de 50)
    │
    ├─ STEP 7: Actualiza el balance → sistemaPago = destino
    │
    └─ STEP 8: Escribe linea de auditoria con desglose de origenes
```

---

## Mapeo de nombres entre tablas

El campo `sistemaPago` tiene nombres ligeramente distintos en cada tabla. El script maneja esto con dos mecanismos:

### Normalizacion (para comparar)

Los siguientes nombres se consideran **equivalentes** al comparar:

| Nombre en Airtable | Se normaliza a |
|---------------------|---------------|
| `Caixa` | caixa |
| `La Caixa` | caixa |
| `Unnax` | unnax |
| `Manual` | manual |
| `DAS` | das |

Esto evita que una renta con "La Caixa" y otra con "Caixa" se traten como sistemas distintos.

### Escritura (nombre exacto por tabla)

Al escribir el nuevo valor, el script usa el nombre correcto para cada tabla:

| Destino | balance | rentas | cashflow |
|---------|---------|--------|----------|
| Unnax | `Unnax` | `Unnax` | `Unnax` |
| Caixa | `Caixa` | `Caixa` | `Caixa` |
| Manual | `Manual` | _(no existe)_ | _(no existe)_ |

---

## Opciones del campo sistemaPago por tabla

| Tabla | Opciones disponibles |
|-------|---------------------|
| balance | Unnax, Caixa, Manual |
| rentas | Unnax, La Caixa, Caixa |
| cashflow | Unnax, Caixa, DAS |

---

## Campos afectados por tabla

### Tabla `balance` (tblYNdOLuMvpBavEu)

| Campo | Field ID | Accion |
|-------|----------|--------|
| fechaCambioSistema | _(nombre)_ | Lee (trigger) |
| nuevoSistemaPago | _(nombre)_ | Lee (trigger) — sistema destino |
| avisoCambioSistema | _(nombre)_ | Escribe log |
| linkMeses | fldFlp2wDVWljyTtC | Lee rentas vinculadas |
| sistemaPago | fldSVisYm1biJH5jz | Lee (actual) + actualiza al destino |

### Tabla `rentas` (tbl2izIaOR37sRHGg)

| Campo | Field ID | Accion |
|-------|----------|--------|
| fecha | fldSdtfW7UfIw8z4V | Lee (para filtrar) |
| sistemaPago | fldKBseprTEyZysG8 | Lee + actualiza al destino |
| linkCashflows | fld7ERQvv5apIJcyX | Lee (para navegar a cashflows) |

### Tabla `cashflow` (tblxY6upsLDmqzaaL)

| Campo | Field ID | Accion |
|-------|----------|--------|
| direccion | fld656RBx2XkCHzR7 | Lee (In/Out) |
| fechaProgramada | fldrquziQqJoTn08B | Lee (para filtrar) |
| sistemaPago | fldjNItVaCzrhlNhf | Lee + actualiza al destino |
| statusIns | fldFyfq8PaqbCRgeN | Lee (verifica "Pendiente") |
| statusOut | fldIMh0gNEA3TuaiG | Lee (verifica "Pendiente") |

---

## Protecciones

- **No toca cashflows ya procesados**: Solo cambia cashflows cuyo status es "Pendiente". Los que estan Cobrados, Pagados, Devueltos, etc. se dejan intactos.
- **No toca rentas pasadas**: Solo filtra rentas con `fecha >= fechaCambioSistema`.
- **No toca cashflows pasados**: Doble filtro por `fechaProgramada >= fechaCambioSistema` y por status "Pendiente".
- **Detecta origen = destino**: Si el balance ya tiene el sistema destino, aborta sin hacer cambios.
- **Salta registros ya en destino**: Si una renta/cashflow individual ya tiene el sistema destino, la ignora (idempotente).
- **Auditoria acumulativa**: Cada ejecucion append una linea al campo `avisoCambioSistema`, nunca sobreescribe el historial anterior.
- **Desglose de origenes**: La auditoria indica cuantos registros venian de cada sistema de origen.

---

## Ejemplos de linea de auditoria

Cambio tipico Caixa → Unnax:
```
[12/02/2026 14:30] CAMBIO SISTEMA Caixa → Unnax (efectivo desde 01/03/2026) — 10 rentas [8×Caixa, 2×La Caixa], 18 cashflows [18×Caixa]
```

Cambio inverso Unnax → Caixa:
```
[15/03/2026 09:45] CAMBIO SISTEMA Unnax → Caixa (efectivo desde 01/04/2026) — 6 rentas [6×Unnax], 12 cashflows [12×Unnax]
```

Manual → Unnax:
```
[20/04/2026 11:00] CAMBIO SISTEMA Manual → Unnax (efectivo desde 01/05/2026) — 4 rentas [4×(vacío)], 8 cashflows [8×(vacío)]
```

---

## Flujo visual

```
                    ┌──────────────────┐
                    │     BALANCE      │
                    │                  │
                    │ nuevoSistemaPago │──── destino (ej. "Unnax")
                    │ fechaCambioSist  │──── trigger
                    │ sistemaPago      │──── actual → destino
                    └────────┬─────────┘
                             │ linkMeses
                    ┌────────▼─────────┐
                    │     RENTAS       │
                    │ (futuras con     │
                    │  sistema ≠ dest) │
                    │                  │
                    │ sistemaPago      │──── * → destino
                    └────────┬─────────┘
                             │ linkCashflows
                    ┌────────▼─────────┐
                    │   CASHFLOWS      │
                    │ (futuros con     │
                    │  sistema ≠ dest  │
                    │  + Pendiente)    │
                    │                  │
                    │ sistemaPago      │──── * → destino
                    └──────────────────┘
```

---

## Combinaciones soportadas

| Origen (actual) | Destino (nuevoSistemaPago) | Caso de uso |
|-----------------|---------------------------|-------------|
| Caixa | Unnax | Migracion principal a Unnax |
| Unnax | Caixa | Rollback / vuelta a Caixa |
| Manual | Unnax | Automatizar deal manual |
| Manual | Caixa | Automatizar deal manual via Caixa |
| Unnax | Manual | Pasar a gestion manual |
| Caixa | Manual | Pasar a gestion manual |

> **Nota**: "Manual" solo existe como opcion en balance, no en rentas ni cashflow. Si el destino es "Manual", se escribira "Manual" en balance y las rentas/cashflows se actualizaran igualmente (el script usa fallback al nombre tal cual).

---

## Scripts relacionados

| Script | Funcion |
|--------|---------|
| `actualizarPrecioRentas.js` | Cambia el importe de rentas futuras y sus cashflows |
| `cancelarRentasFuturas.js` | Cancela rentas y cashflows futuros (importe → 0, status → Cancelado) |
| **`cambiarSistemaPago.js`** | Cambia el sistema de pago entre cualquier combinacion |
