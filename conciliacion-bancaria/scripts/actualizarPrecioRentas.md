# Actualizacion No Retroactiva de Precio de Rentas

Script de Airtable Automation para cambiar el precio del alquiler a partir de una fecha determinada, actualizando rentas futuras, sus cashflows asociados y generando automaticamente un ajuste de servicio si el precio sube.

---

## Caso de uso

Cuando cambia el precio de un alquiler (ej. actualizacion IPC, renegociacion), este script:

1. Actualiza el importe de todas las rentas tipo "Alquiler" futuras
2. Recalcula los cashflows vinculados, respetando la comision de servicio (importeServicio) prorrateada de cada renta
3. **Si el precio sube**: calcula automaticamente el extra de comision de servicio sobre la diferencia de precio para los meses restantes, y crea una renta + cashflow de ajuste concentrado en el primer mes

---

## Prerequisitos en Airtable

### Tabla `balance`

Los campos `nuevoPrecio`, `fechaNuevoPrecio` y `avisoNuevoPrecio` deben existir. Si no existen, crearlos manualmente:

| Campo | Tipo | Field ID | Descripcion |
|-------|------|----------|-------------|
| `nuevoPrecio` | Number | fldiWklj6yoWqsQSH | Nuevo importe del alquiler |
| `fechaNuevoPrecio` | Date | fldMjSkNNd7J7BetK | Fecha desde la que aplicar el nuevo precio |
| `avisoNuevoPrecio` | Long text | fldaV2nYiekBXEHVz | Log de auditoria acumulativo (lo rellena el script) |

### Tabla `deals` + lookup en `balance`

Para el calculo del ajuste de servicio, se necesita el porcentaje de comision del deal:

| Campo | Tabla | Tipo | Field ID | Descripcion |
|-------|-------|------|----------|-------------|
| `comisionProductoAplicable` | deals | Percent | fldW0Zd7ZGb9IxzW2 | Porcentaje de comision (ej: 0.05 = 5%, 0.06 = 6%) |
| `linkDealComisionProductoAplicable` | balance | Lookup | fldA0WTOnkrCY0pre | Lookup via linkDeal → comisionProductoAplicable |

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
Balance (nuevoPrecio = 950, fechaNuevoPrecio = 01/09/2025, precioAnterior = 876)
    │
    ├─ STEP 1: Lee el balance → nuevoPrecio, fechaNuevoPrecio, precio anterior,
    │           porcentaje servicio (desde deal via lookup)
    │
    ├─ STEP 2: Filtra rentas vinculadas
    │           └─ tipo = "Alquiler" (ignora "Comision Advancing" y otros)
    │           └─ fecha >= 01/09/2025
    │
    ├─ STEP 3: Actualiza importe de esas rentas → €950
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
    ├─ STEP 7: Si diferencia > 0 y porcentajeServicio > 0:
    │           └─ Calcula: (950 - 876) × 6% × 6 meses = €26.64
    │           └─ Crea 1 renta "Comision Advancing" (fecha = primer mes)
    │           └─ Crea 1 cashflow In vinculado (€26.64, Pendiente)
    │
    └─ STEP 8: Escribe linea de auditoria en avisoNuevoPrecio
```

---

## Ajuste de servicio por cambio de precio

Cuando el precio del alquiler sube, la comision de servicio (% sobre la renta) deberia aplicarse tambien sobre el incremento. El script calcula automaticamente este extra y lo concentra en un unico cobro.

### Calculo

```
diferencia = nuevoPrecio - precioAnterior
meses_pendientes = numero de rentas futuras tipo "Alquiler"
porcentaje_servicio = comisionProductoAplicable del deal (ej: 0.06 = 6%)

importe_ajuste = diferencia × porcentaje_servicio × meses_pendientes
```

### Ejemplo

```
Renta antigua: €876/mes
Renta nueva:   €950/mes (desde 01/09/2025)
Quedan:        6 meses de contrato
Porcentaje:    6%

diferencia = 950 - 876 = €74
importe_ajuste = 74 × 0.06 × 6 = €26.64

→ Se crea 1 renta "Comision Advancing" por €26.64 en 01/09/2025
→ Se crea 1 cashflow In por €26.64 (Pendiente) vinculado a esa renta
```

### Condiciones

El ajuste **solo se crea** cuando:
- El precio sube (`diferencia > 0`)
- El deal tiene `comisionProductoAplicable` definido y > 0
- Hay al menos 1 renta futura

Si el precio baja o el porcentaje no esta disponible, no se crea ningun ajuste.

### Reparto mensual (futuro)

Actualmente el importe total se concentra en el primer mes. El codigo esta preparado para cambiar a reparto mensual modificando las lineas de `importesPorMes` y `fechasPorMes` (ver comentarios en el script).

---

## Logica de importes en cashflows

El script respeta la comision de servicio prorrateada por renta:

```
Cashflow In (cobro al inquilino):
    nuevoImporte = nuevoPrecio + importeServicio de la renta
    Ejemplo: €950 + €45.83 = €995.83

Cashflow Out (pago al propietario):
    nuevoImporte = nuevoPrecio (sin comision)
    Ejemplo: €950
```

> **Nota**: La comision mensual se gestiona mediante `importeServicio` en cada renta (puede estar prorrateada), NO con la comision global del deal. El ajuste de servicio por cambio de precio es un cobro adicional separado.

---

## Campos afectados por tabla

### Tabla `balance` (tblYNdOLuMvpBavEu)

| Campo | Field ID | Accion |
|-------|----------|--------|
| nuevoPrecio | fldiWklj6yoWqsQSH | Lee (trigger) |
| fechaNuevoPrecio | fldMjSkNNd7J7BetK | Lee (trigger) |
| linkMeses | fldFlp2wDVWljyTtC | Lee rentas vinculadas |
| importe | fldtJw4GfIzEtc7h2 | Lee (precio anterior, para auditoria y calculo) |
| linkDealComisionProductoAplicable | fldA0WTOnkrCY0pre | Lee (% servicio del deal) |
| avisoNuevoPrecio | fldaV2nYiekBXEHVz | Escribe log |

### Tabla `rentas` (tbl2izIaOR37sRHGg)

| Campo | Field ID | Accion |
|-------|----------|--------|
| fecha | fldSdtfW7UfIw8z4V | Lee (para filtrar) |
| tipo | fldTWeJAYDxWOZWPJ | Lee (solo "Alquiler") / Escribe ("Comision Advancing" para ajuste) |
| importe | fld2DbSB516n1bU8f | Actualiza a nuevoPrecio |
| importeServicio | fldS4Zqn2KLOox9jG | Lee (comision prorrateada) / Escribe (importe ajuste) |
| linkCashflows | fld7ERQvv5apIJcyX | Lee (para navegar a cashflows) |
| dealBalance | fldfh0vDzeqRuTFFE | Escribe (link al balance, para renta de ajuste) |

### Tabla `cashflow` (tblxY6upsLDmqzaaL)

| Campo | Field ID | Accion |
|-------|----------|--------|
| direccion | fld656RBx2XkCHzR7 | Lee (In/Out) / Escribe (In para ajuste) |
| fechaProgramada | fldrquziQqJoTn08B | Lee (para filtrar) / Escribe (fecha ajuste) |
| importe | fldbkCQZwDR8a9kRP | Actualiza (nuevoPrecio +/- servicio) / Escribe (importe ajuste) |
| statusIns | fldFyfq8PaqbCRgeN | Escribe (Pendiente para ajuste) |
| linkRenta | fldsTJCCfItHDoCgS | Escribe (link a renta de ajuste) |
| linkDealBalance | fldyCWFzrTMhWs7FT | Escribe (link al balance para ajuste) |
| razon | fld17mZxxLYPQfUzr | Escribe (Renta para ajuste) |
| sujeto | fldazRk0SXXdqQo9L | Escribe (Pagador alquiler para ajuste) |

---

## Protecciones

- **Solo rentas tipo "Alquiler"**: Ignora rentas de "Comision Advancing", "DAS" y otros tipos.
- **No toca rentas pasadas**: Solo filtra rentas con `fecha >= fechaNuevoPrecio`.
- **No toca cashflows pasados**: Solo filtra cashflows con `fechaProgramada >= fechaNuevoPrecio`.
- **Respeta importeServicio individual**: Cada renta puede tener una comision prorrateada distinta. El cashflow In se calcula con la comision de SU renta, no una global.
- **Ajuste solo si sube**: El ajuste de servicio solo se crea cuando `nuevoPrecio > precioAnterior`.
- **Sin porcentaje, sin ajuste**: Si el deal no tiene `comisionProductoAplicable`, el script funciona igual que antes (solo actualiza rentas y cashflows, sin crear ajuste).
- **Auditoria acumulativa**: Cada ejecucion append una linea al campo `avisoNuevoPrecio`, nunca sobreescribe.

---

## Ejemplo de linea de auditoria

Sin ajuste de servicio:
```
[12/02/2026 14:30] €800 → €850 (efectivo desde 01/03/2026) — 10 rentas, 18 cashflows (9 In, 9 Out)
```

Con ajuste de servicio:
```
[12/02/2026 14:30] €876 → €950 (efectivo desde 01/09/2025) — 6 rentas, 12 cashflows (6 In, 6 Out) | Ajuste servicio: €26.64 (dif €74 × 6% × 6 meses)
```

---

## Flujo visual

```
                    ┌─────────────────┐
                    │     BALANCE     │
                    │                 │
                    │ nuevoPrecio     │──── €950
                    │ fechaNuevoPrecio│──── trigger
                    │ comision (deal) │──── 6%
                    └────────┬────────┘
                             │ linkMeses
                    ┌────────▼────────┐
                    │     RENTAS      │
                    │ (futuras tipo   │
                    │  "Alquiler")    │
                    │                 │
                    │ importe         │──── → €950
                    └────────┬────────┘
                             │ linkCashflows
              ┌──────────────┼──────────────┐
     ┌────────▼────────┐           ┌────────▼────────┐
     │   CASHFLOW In   │           │  CASHFLOW Out   │
     │ (cobro inq.)    │           │ (pago prop.)    │
     │                 │           │                 │
     │ importe =       │           │ importe =       │
     │ 950 + servicio  │           │ 950             │
     └─────────────────┘           └─────────────────┘

     Si diferencia > 0 y porcentaje > 0:

              ┌──────────────────────────────┐
              │  NUEVA RENTA (Comision Adv.) │
              │  fecha = primer mes nuevo    │
              │  importeServicio = €26.64    │
              └──────────────┬───────────────┘
                             │
              ┌──────────────▼───────────────┐
              │  NUEVO CASHFLOW In           │
              │  importe = €26.64            │
              │  status = Pendiente          │
              │  razon = Renta               │
              └──────────────────────────────┘
```

---

## Scripts relacionados

| Script | Funcion |
|--------|---------|
| **`actualizarPrecioRentas.js`** | Cambia el importe de rentas futuras, sus cashflows y genera ajuste de servicio |
| `cancelarRentasFuturas.js` | Cancela rentas y cashflows futuros (importe → 0, status → Cancelado) |
| `cambiarSistemaPago.js` | Cambia el sistema de pago de Caixa a Unnax |
