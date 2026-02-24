# Auditoría: Gestión de Partes (DAS/Onlygal) y Granularidad de Pagos

**Fecha**: 24/02/2026
**Alcance**: Modelo de datos, procesos de reconciliación, scripts de automatización
**Base Airtable**: Conciliación Bancaria (`appuV5kGKzKdXlhoR`)

---

## PARTE 1: PROBLEMAS DETECTADOS

---

### 1.1 — `prefersSingleRecordLink` en campos que necesitan N registros

**Gravedad: ALTA**

Varios campos linked-record están configurados con `prefersSingleRecordLink: true` en Airtable, lo que limita la UI a mostrar/seleccionar un solo registro, pero la lógica de negocio requiere relaciones 1:N.

| Tabla | Campo | Field ID | Enlaza a | Problema |
|-------|-------|----------|----------|----------|
| **partes** | `linkMeses` | `fldAyaTDASeRJLX0a` | rentas | DAS puede cubrir **varias mensualidades** impagadas en un solo parte. Con `prefersSingleRecordLink: true`, la UI solo muestra 1 renta. |
| **partes** | `linkCashInIncidencia` | `fldpYFcbI1O6L5kkd` | cashflow | Un parte puede tener **múltiples cashflows de incidencia** (uno por cada mes impagado). El campo debería ser N. |
| **partes** | `linkCashInCompensacion` | `fldckKN76GQHPrqbk` | cashflow | DAS puede compensar en **varios pagos parciales**. El campo debería ser N. |
| **rentas** | `linkDASParte` | `fldsYTl4v6TPDxeat` | partes | Una renta solo tiene 1 parte asociado, esto está correcto. Pero el **inverso** (`linkMeses`) es el que falla. |

**Impacto**: Al abrir un parte en Airtable que cubre 3 meses de impago, solo se ve 1 renta enlazada. Los cashflows de incidencia/compensación tampoco se pueden ver todos desde la UI de partes.

---

### 1.2 — DAS tratado como "sistemaPago" cuando es un "sujeto pagador"

**Gravedad: ALTA**

En el campo `cashflow.sistemaPago` (`fldjNItVaCzrhlNhf`), "DAS" aparece como opción junto a "Unnax" y "Caixa":

```
cashflow.sistemaPago: Unnax | Caixa | DAS
```

**El problema**: DAS/Onlygal no es un sistema de pago (no es una pasarela bancaria). Es una **aseguradora que paga mediante transferencia bancaria**. El dinero de DAS llega vía Caixa o transferencia, no por un canal propio.

**Consecuencias**:
- Los scripts `cambiarSistemaPago.js` tratan DAS como un sistema a migrar, lo cual no tiene sentido conceptual.
- No queda registrado por qué **canal bancario real** llegó el dinero de DAS.
- Se mezclan dos dimensiones: *quién paga* (DAS vs inquilino vs propietario) con *cómo paga* (Unnax vs Caixa vs transferencia).

**Lo que ya existe y es correcto**:
- `cashflow.sujeto`: `Pagador alquiler | DAS | Propietario` → Esto SÍ refleja quién paga.
- `cashflow.razon`: `Renta | Recobro | DAS` → Esto SÍ refleja el motivo.

---

### 1.3 — No hay campo de importe parcial en la relación Transaction↔Cashflow

**Gravedad: MEDIA-ALTA**

Cuando DAS paga €3.000 que corresponden a 3 meses impagados de €1.000 cada uno, no hay manera de registrar el desglose:

```
SITUACIÓN ACTUAL:
  1 transferencia DAS (€3.000) → 1 cashflow (€3.000) → 1 renta (???)

  ¿O debería ser?
  1 transferencia DAS (€3.000) → 3 cashflows (€1.000 c/u) → 3 rentas
```

**No existe**:
- Un campo `importeAplicado` en la tabla intermedia transaction↔cashflow
- Una tabla intermedia de "aplicaciones de pago" para desglosar un ingreso entre varios cashflows
- Reglas documentadas sobre cómo splitear un pago DAS entre múltiples meses

---

### 1.4 — Devoluciones apuntan a tabla deprecada

**Gravedad: MEDIA**

El campo `partes.linkCashoutDevolucion` (`flddHa4FAFOE1U3Ab`) enlaza a la tabla `cashout /deprecated/` (`tblRe7RrddAjqTl54`).

```
partes.linkCashoutDevolucion → cashout /deprecated/ (tblRe7RrddAjqTl54)
```

Esta tabla está marcada como deprecada. Las nuevas devoluciones deberían gestionarse mediante cashflows con `direccion: Out` y `statusOut: Devuelto`.

**Impacto**: Los partes nuevos que necesiten registrar devoluciones al inquilino (cuando DAS paga y luego el inquilino paga también) no tienen un campo correcto para enlazar al cashflow de devolución actual.

---

### 1.5 — Doble enlace Caixa en cashflow genera ambigüedad

**Gravedad: MEDIA**

La tabla `cashflow` tiene **dos campos** que enlazan a la tabla `Transactions` (Caixa):

| Campo | Field ID | Inverso en Transactions |
|-------|----------|------------------------|
| `linkTransactionsCaixa` | `fldz6bEbVOE6rc6zQ` | `fldNyHa686Ed6apqu` (`linkCashflow`) |
| `Transactions` | `fldVLoOdobs1Y1ByC` | `fldfWnsujIsEMjxDN` (`linkCashflows`) |

Dos campos con el mismo propósito (enlazar cashflow ↔ transacción Caixa) genera confusión sobre cuál usar. Los scripts solo usan `linkTransactionsCaixa`, pero el campo `Transactions` también existe y puede contener datos.

---

### 1.6 — El status "Cancelado" no existe en los Select del schema

**Gravedad: MEDIA**

El script `cancelarRentasFuturas.js` (líneas 218-232) establece:
```javascript
{ name: 'Cancelado' }  // para statusIns y statusOut
```

Pero los valores definidos en el schema son:

```
statusIns: Pendiente | Cobrado | Cobrada con retraso | Devuelta | Pago parcial |
           Recuperada vía DAS | Recuperada vía arrendatario

statusOut: Pendiente | Pagado | Devuelto
```

**"Cancelado" no aparece** en ninguno de los dos campos. Airtable creará la opción automáticamente la primera vez que el script la escriba, pero sin color ni formato definido, y no aparecerá en filtros/vistas preconfigurads.

---

### 1.7 — Inconsistencia en nombres de sistema de pago entre tablas

**Gravedad: BAJA-MEDIA**

Cada tabla usa nombres distintos para el mismo concepto:

| Tabla | Campo | Opciones |
|-------|-------|----------|
| **balance** | `sistemaPago` | `Unnax` \| `Caixa` \| `Manual` |
| **rentas** | `sistemaPago` | `Unnax` \| `La Caixa` \| `Caixa` |
| **cashflow** | `sistemaPago` | `Unnax` \| `Caixa` \| `DAS` |

El script `cambiarSistemaPago.js` gestiona esto con `normalizeSistema()` y `getNombreParaTabla()`, pero:
- "La Caixa" en rentas vs "Caixa" en balance y cashflow genera confusión.
- "Manual" solo existe en balance, no en cashflow ni rentas.
- "DAS" solo existe en cashflow, no debería estar como sistema de pago (ver punto 1.2).

---

### 1.8 — No hay proceso automatizado para crear partes

**Gravedad: ALTA**

Los tres scripts de automatización existentes (`actualizarPrecioRentas.js`, `cambiarSistemaPago.js`, `cancelarRentasFuturas.js`) gestionan rentas y cashflows, pero **ninguno gestiona partes DAS**.

No existe:
- Script para crear un parte cuando se detecta impago
- Script para crear los cashflows DAS asociados a un parte
- Script para actualizar el status del parte cuando DAS paga
- Script para gestionar la compensación (cashflow Out al propietario cuando DAS paga)
- Script para cerrar el parte cuando el inquilino paga directamente

**Impacto**: Toda la gestión de partes DAS es manual, lo que:
- Aumenta el riesgo de error humano
- No garantiza que los cashflows se creen con los campos correctos
- No mantiene la coherencia entre el status del parte y los cashflows asociados

---

### 1.9 — Campo `importe` del parte sin relación clara con rentas

**Gravedad: MEDIA**

El campo `partes.importe` (`fldH0XJ3p21Zy88V2`) es un valor manual en €. No hay:
- Rollup que sume el importe de las rentas enlazadas
- Validación de que `importe` del parte == suma de importes de rentas impagadas
- Campo que distinga entre importe reclamado vs importe cobrado

---

### 1.10 — Sin tracking de fechas clave del ciclo de vida del parte

**Gravedad: MEDIA**

La tabla `partes` solo tiene `fechaCreacion`. Faltan:

| Fecha necesaria | Existe | Propósito |
|----------------|--------|-----------|
| `fechaCreacion` | Sí | Apertura del parte |
| `fechaReclamacion` | No | Cuándo se envió la reclamación a DAS |
| `fechaPagoDAS` | No | Cuándo DAS pagó (parcial o total) |
| `fechaCierre` | No | Cuándo se cerró el parte |
| `fechaRecuperacionInquilino` | No | Cuándo el inquilino pagó lo adeudado |

---

### 1.11 — Sin importe desglosado (reclamado vs cobrado vs pendiente)

**Gravedad: MEDIA**

El parte solo tiene un campo `importe`. Para una gestión completa necesita:

| Campo | Existe | Propósito |
|-------|--------|-----------|
| `importeReclamado` | No (solo `importe`) | Total reclamado a DAS |
| `importeCobradoDAS` | No | Lo que DAS ha pagado efectivamente |
| `importeRecuperadoInquilino` | No | Lo que se ha recuperado directamente del inquilino |
| `importePendiente` | No | Lo que falta por cobrar |

---

### 1.12 — Balance.status "Con incidencias" no se actualiza automáticamente

**Gravedad: BAJA**

El campo `balance.status` tiene la opción "Con incidencias" (`selv87oiiy0FWgQJb`), y existe un campo count `Cobros con incidencias` (`fldCHqFNDc2iUlYM4`). Pero no hay automatización que pase el balance a "Con incidencias" cuando se crea un parte o cuando un cashflow se marca como "Devuelta".

---

## PARTE 2: SOLUCIÓN PROPUESTA — MODELO DE DATOS

---

### 2.1 — Separar "quién paga" de "cómo paga" en cashflow

**Cambio en `cashflow.sistemaPago`**:

```
ANTES:  Unnax | Caixa | DAS
DESPUÉS: Unnax | Caixa | Transferencia manual
```

Eliminar "DAS" como opción de `sistemaPago`. En su lugar, usar los campos existentes:

| Dimensión | Campo existente | Valores |
|-----------|----------------|---------|
| **Canal bancario** | `sistemaPago` | `Unnax` \| `Caixa` \| `Transferencia manual` |
| **Quién paga** | `sujeto` | `Pagador alquiler` \| `DAS` \| `Propietario` |
| **Motivo** | `razon` | `Renta` \| `Recobro` \| `DAS` |

**Regla de negocio**: Cuando DAS paga, el cashflow se crea así:
```
sistemaPago = "Caixa" (o "Transferencia manual", según cómo llegue el dinero)
sujeto = "DAS"
razon = "DAS"
statusIns = "Recuperada vía DAS"
```

---

### 2.2 — Quitar `prefersSingleRecordLink` en partes

**Cambios en tabla `partes`**:

| Campo | Field ID | prefersSingleRecordLink actual | Propuesto |
|-------|----------|-------------------------------|-----------|
| `linkMeses` | `fldAyaTDASeRJLX0a` | `true` | **`false`** — Un parte puede cubrir N meses |
| `linkCashInIncidencia` | `fldpYFcbI1O6L5kkd` | `true` | **`false`** — Puede haber N cashflows de incidencia |
| `linkCashInCompensacion` | `fldckKN76GQHPrqbk` | `true` | **`false`** — DAS puede pagar en N veces |

> En Airtable, esto se cambia desde Field configuration → desmarcar "Limit to single record".

---

### 2.3 — Nuevos campos para la tabla `partes`

#### Campos de fecha (tracking del ciclo de vida):

| Campo nuevo | Tipo | Propósito |
|-------------|------|-----------|
| `fechaReclamacion` | Date | Fecha de envío de la reclamación a DAS/Onlygal |
| `fechaPagoDAS` | Date | Fecha en que DAS realizó el pago (último si hay varios) |
| `fechaCierre` | Date | Fecha de cierre definitivo del parte |
| `fechaRecuperacionInquilino` | Date | Fecha en que el inquilino pagó lo adeudado |

#### Campos de importe (desglose financiero):

| Campo nuevo | Tipo | Propósito |
|-------------|------|-----------|
| `importeReclamado` | Currency (€) | Total reclamado a DAS (renombrar `importe` actual) |
| `importeCobradoDAS` | Rollup | SUM de cashflows en `linkCashInCompensacion.importe` |
| `importeRecuperadoInquilino` | Rollup | SUM de cashflows con `sujeto = "Pagador alquiler"` en rentas vinculadas, filtrados por `statusIns IN (Cobrado, Cobrada con retraso, Recuperada vía arrendatario)` |
| `importePendiente` | Formula | `importeReclamado - importeCobradoDAS - importeRecuperadoInquilino` |

#### Campo de enlace corregido (reemplazar tabla deprecada):

| Campo nuevo | Tipo | Propósito |
|-------------|------|-----------|
| `linkCashOutDevolucion` | Link to cashflow | Reemplaza el enlace a `cashout /deprecated/`. Enlaza a cashflows con `direccion: Out` que son devoluciones al inquilino cuando DAS ya pagó. |

#### Campo de tipo de seguro:

| Campo nuevo | Tipo | Opciones | Propósito |
|-------------|------|----------|-----------|
| `aseguradora` | Single Select | `DAS` \| `Onlygal` \| `Otra` | Identificar qué aseguradora gestiona el parte |

---

### 2.4 — Nuevo valor en `statusIns` de cashflow

Añadir a `cashflow.statusIns`:

| Valor nuevo | Color sugerido | Propósito |
|-------------|---------------|-----------|
| `Cancelado` | gris | Para el script `cancelarRentasFuturas.js`. Definirlo formalmente en el schema. |

Añadir a `cashflow.statusOut`:

| Valor nuevo | Color sugerido | Propósito |
|-------------|---------------|-----------|
| `Cancelado` | gris | Mismo caso. |

---

### 2.5 — Unificar nombres de sistema de pago

**Propuesta de normalización**:

| Tabla | Campo | Opciones actuales | Opciones propuestas |
|-------|-------|-------------------|---------------------|
| **balance** | `sistemaPago` | Unnax \| Caixa \| Manual | Unnax \| Caixa \| Manual *(sin cambio)* |
| **rentas** | `sistemaPago` | Unnax \| La Caixa \| Caixa | Unnax \| Caixa *(eliminar "La Caixa", migrar registros)* |
| **cashflow** | `sistemaPago` | Unnax \| Caixa \| DAS | Unnax \| Caixa \| Manual *(reemplazar DAS, añadir Manual)* |

**Migración**: Los cashflows con `sistemaPago = "DAS"` deben migrarse a `sistemaPago = "Caixa"` (o "Manual" según el caso). La información de que es DAS se conserva en `sujeto = "DAS"` y `razon = "DAS"`.

---

### 2.6 — Eliminar enlace duplicado Caixa en cashflow

Deprecar uno de los dos campos que enlazan a la tabla Transactions (Caixa):

| Campo | Acción | Motivo |
|-------|--------|--------|
| `linkTransactionsCaixa` (`fldz6bEbVOE6rc6zQ`) | **MANTENER** | Usado por scripts, nombre más claro |
| `Transactions` (`fldVLoOdobs1Y1ByC`) | **DEPRECAR** | Duplicado, migrar datos al campo anterior |

---

### 2.7 — Diagrama del modelo propuesto

```
DEALS (contratos)
  │
  └─── 1:N ──→ BALANCE (resumen mensual por propiedad)
                  │
                  ├─── 1:N ──→ RENTAS (mensualidades)
                  │              │
                  │              ├─── 1:N ──→ CASHFLOWS (movimientos de caja)
                  │              │              │
                  │              │              ├── linkTransactions → transactionsUnnax
                  │              │              ├── linkTransactionsCaixa → Transactions (Caixa)
                  │              │              ├── linkDASParteIncidencia → PARTES
                  │              │              └── linkDASParteCompensacion → PARTES
                  │              │
                  │              └─── N:1 ──→ PARTES (incidencias DAS)
                  │                            (via linkDASParte)
                  │
                  └─── 1:N ──→ PARTES (partes DAS por balance)
                                 │
                                 ├── linkMeses ──→ RENTAS [N] (meses afectados)
                                 ├── linkCashInIncidencia ──→ CASHFLOWS [N] (cobros impagados)
                                 ├── linkCashInCompensacion ──→ CASHFLOWS [N] (pagos DAS)
                                 ├── linkCashOutDevolucion ──→ CASHFLOWS [N] (devoluciones) [NUEVO]
                                 │
                                 ├── importeReclamado (€)
                                 ├── importeCobradoDAS (rollup)
                                 ├── importeRecuperadoInquilino (rollup)
                                 ├── importePendiente (formula)
                                 │
                                 ├── fechaCreacion
                                 ├── fechaReclamacion [NUEVO]
                                 ├── fechaPagoDAS [NUEVO]
                                 ├── fechaCierre [NUEVO]
                                 └── fechaRecuperacionInquilino [NUEVO]
```

---

## PARTE 3: PROCESOS PROPUESTOS — CICLO DE VIDA DEL PARTE

---

### 3.1 — Proceso 1: Apertura de parte (impago detectado)

**Trigger**: Un cashflow In tiene `statusIns = "Devuelta"` o pasa X días con `statusIns = "Pendiente"` sin cobro.

**Pasos del script `abrirParte.js`**:

```
ENTRADA:
  - cashflowId (el cashflow devuelto/impagado)

PASO 1: Leer el cashflow
  → Obtener: linkRenta, linkDealBalance, importe, fechaProgramada

PASO 2: Verificar que no exista ya un parte para esta renta
  → Leer renta.linkDASParte
  → Si ya existe un parte abierto → STOP (no duplicar)

PASO 3: Crear registro en tabla partes
  → {
      status: "Abierto",
      fechaCreacion: HOY,
      importeReclamado: renta.importe,  // o importeTotal si incluye servicio
      linkMeses: [rentaId],
      linkCashInIncidencia: [cashflowId],
      dealBalance: [balanceId],
      aseguradora: "DAS"  // o lookup de la póliza del deal
    }

PASO 4: Enlazar la renta al parte
  → renta.linkDASParte = [parteId]

PASO 5: Actualizar cashflow de incidencia
  → cashflow.linkDASParteIncidencia = [parteId]
  → cashflow.razon = "DAS"  // marcar que es una incidencia DAS

PASO 6: Actualizar balance status
  → Si balance.status != "Con incidencias" → balance.status = "Con incidencias"

PASO 7: Audit trail
  → Escribir en balance.notas o campo dedicado:
    "[DD/MM/YYYY HH:MM] PARTE ABIERTO - Ref: (pendiente DAS) - €X - Renta MM/YYYY"
```

---

### 3.2 — Proceso 2: Añadir meses al parte existente

**Trigger**: Otro cashflow In del mismo balance resulta `statusIns = "Devuelta"` y ya hay un parte abierto.

**Pasos del script `ampliarParte.js`**:

```
ENTRADA:
  - cashflowId (nuevo cashflow devuelto)
  - parteId (parte existente abierto)

PASO 1: Leer el parte actual
  → Obtener: linkMeses, importeReclamado, linkCashInIncidencia

PASO 2: Leer el cashflow nuevo
  → Obtener: linkRenta, importe

PASO 3: Actualizar el parte
  → linkMeses: [...mesActuales, nuevaRentaId]
  → linkCashInIncidencia: [...cashflowsActuales, cashflowId]
  → importeReclamado: importeActual + renta.importe

PASO 4: Enlazar la renta al parte
  → renta.linkDASParte = [parteId]

PASO 5: Actualizar cashflow
  → cashflow.linkDASParteIncidencia = [parteId]

PASO 6: Audit trail
  → "[DD/MM/YYYY HH:MM] PARTE AMPLIADO - +€X (Renta MM/YYYY) - Total: €Y - N meses"
```

---

### 3.3 — Proceso 3: DAS paga (total o parcial)

**Trigger**: Se recibe transferencia de DAS identificada en Caixa/banco.

**Pasos del script `registrarPagoDAS.js`**:

```
ENTRADA:
  - parteId
  - importePagado (€)
  - transactionId (de tabla Transactions Caixa, opcional)

PASO 1: Leer el parte
  → Obtener: linkMeses, importeReclamado, importeCobradoDAS actual, dealBalance

PASO 2: Crear cashflow IN de compensación DAS
  → {
      direccion: "In",
      importe: importePagado,
      statusIns: "Recuperada vía DAS",
      sistemaPago: "Caixa",  // canal real por donde llegó el dinero
      sujeto: "DAS",
      razon: "DAS",
      metodoPago: "Transferencia",
      fechaProgramada: HOY,
      fechaPago: HOY,
      linkDealBalance: [balanceId],
      linkRenta: [rentaIds],  // enlazar a las rentas afectadas
      linkDASParteCompensacion: [parteId],
      linkTransactionsCaixa: [transactionId]  // si existe
    }

PASO 3: Enlazar cashflow al parte
  → parte.linkCashInCompensacion = [...existentes, nuevoCashflowId]

PASO 4: Calcular nuevo estado del parte
  → totalCobrado = importeCobradoDAS + importePagado
  → SI totalCobrado >= importeReclamado:
      parte.status = "DAS paga total de rentas"
      parte.fechaPagoDAS = HOY
    SI totalCobrado < importeReclamado Y totalCobrado > 0:
      parte.status = "DAS paga parcial de renta"
      parte.fechaPagoDAS = HOY

PASO 5: Actualizar rentas afectadas
  → Para cada renta en linkMeses:
    → Actualizar los cashflows In originales (los de incidencia):
      → statusIns = "Recuperada vía DAS"

PASO 6: Crear cashflow OUT al propietario (si aplica)
  → Solo si el propietario aún no ha recibido el pago de esos meses:
  → {
      direccion: "Out",
      importe: importeAPagarPropietario,  // renta sin comisión de servicio
      statusOut: "Pendiente",
      sistemaPago: balance.sistemaPago,
      sujeto: "Propietario",
      razon: "DAS",
      linkDealBalance: [balanceId],
      linkRenta: [rentaIds]
    }

PASO 7: Audit trail
  → "[DD/MM/YYYY HH:MM] DAS PAGA €X - Parte Ref:Y - Status: Total/Parcial"
```

---

### 3.4 — Proceso 4: El inquilino paga directamente (sin DAS o tras DAS)

**Trigger**: El inquilino paga la deuda directamente.

**Pasos del script `recuperacionInquilino.js`**:

```
ENTRADA:
  - parteId
  - cashflowId (el pago del inquilino)
  - esConDAS (boolean: si DAS ya pagó algo)

PASO 1: Leer el parte y cashflow

PASO 2: Actualizar status del parte
  → SI DAS NO pagó nada:
      parte.status = "Cerrado por recuperación de renta vía inquilino (sin DAS)"
    SI DAS pagó parcial/total:
      parte.status = "Cerrado tras recuperación de renta vía inquilino"
  → parte.fechaRecuperacionInquilino = HOY
  → parte.fechaCierre = HOY

PASO 3: Actualizar cashflow del inquilino
  → cashflow.statusIns = "Recuperada vía arrendatario"

PASO 4: Si DAS ya pagó → gestionar devolución a DAS
  → Crear cashflow OUT a DAS (si aplica devolución):
  → {
      direccion: "Out",
      importe: importeADevolver,
      statusOut: "Pendiente",
      sujeto: "DAS",
      razon: "DAS",
      linkDASParteCompensacion: [parteId]
    }
  → Enlazar en parte.linkCashOutDevolucion

PASO 5: Audit trail
  → "[DD/MM/YYYY HH:MM] RECUPERACIÓN VÍA INQUILINO €X - Parte Ref:Y - Cerrado"
```

---

### 3.5 — Proceso 5: Cierre sin recuperación

**Trigger**: Se determina que la deuda es irrecuperable.

**Pasos del script `cerrarParteSinRecuperacion.js`**:

```
ENTRADA:
  - parteId

PASO 1: Actualizar status
  → parte.status = "Cerrado sin recuperación vía inquilino"
  → parte.fechaCierre = HOY

PASO 2: Audit trail
  → "[DD/MM/YYYY HH:MM] PARTE CERRADO SIN RECUPERACIÓN - Ref:Y - €X pendiente"
```

---

### 3.6 — Diagrama de estados del parte

```
                    ┌─────────────┐
                    │   ABIERTO   │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
     ┌────────────┐  ┌──────────┐  ┌───────────────────────────┐
     │ DAS paga   │  │ DAS paga │  │ Inquilino paga            │
     │ parcial    │  │ total    │  │ directamente (sin DAS)    │
     └─────┬──────┘  └────┬─────┘  └─────────────┬─────────────┘
           │               │                      │
           │          ┌────┴─────┐                │
           │          ▼          ▼                ▼
           │  ┌──────────┐ ┌──────────┐  ┌──────────────────────────┐
           │  │ Cerrado   │ │ Cerrado  │  │ Cerrado por recuperación │
           │  │ tras rec. │ │ sin rec. │  │ vía inquilino (sin DAS)  │
           │  │ inquilino │ │ inquil.  │  └──────────────────────────┘
           │  └──────────┘ └──────────┘
           │
           ▼
     ┌────────────┐
     │ DAS paga   │ (acumula más pagos hasta llegar a total)
     │ total      │
     └────────────┘
```

**Transiciones válidas**:

| Desde | Hacia | Trigger |
|-------|-------|---------|
| Abierto | DAS paga parcial | `registrarPagoDAS` con importe < reclamado |
| Abierto | DAS paga total | `registrarPagoDAS` con importe >= reclamado |
| Abierto | Cerrado sin DAS | `recuperacionInquilino` sin pago DAS previo |
| DAS paga parcial | DAS paga total | `registrarPagoDAS` acumula hasta >= reclamado |
| DAS paga parcial | Cerrado tras recuperación | `recuperacionInquilino` completa lo que falta |
| DAS paga total | Cerrado tras recuperación | `recuperacionInquilino` (inquilino paga, devolver a DAS) |
| DAS paga total | Cerrado sin recuperación | Decisión manual, irrecuperable |
| Abierto | Cerrado sin recuperación | Decisión manual, irrecuperable |

---

## PARTE 4: RESUMEN EJECUTIVO DE CAMBIOS

---

### Cambios en schema de Airtable

| # | Tabla | Cambio | Tipo | Prioridad |
|---|-------|--------|------|-----------|
| 1 | partes | Quitar `prefersSingleRecordLink` en `linkMeses` | Config | ALTA |
| 2 | partes | Quitar `prefersSingleRecordLink` en `linkCashInIncidencia` | Config | ALTA |
| 3 | partes | Quitar `prefersSingleRecordLink` en `linkCashInCompensacion` | Config | ALTA |
| 4 | partes | Añadir campos: `fechaReclamacion`, `fechaPagoDAS`, `fechaCierre`, `fechaRecuperacionInquilino` | Campos nuevos | ALTA |
| 5 | partes | Renombrar `importe` → `importeReclamado` | Rename | MEDIA |
| 6 | partes | Añadir rollup `importeCobradoDAS` | Campo nuevo | MEDIA |
| 7 | partes | Añadir formula `importePendiente` | Campo nuevo | MEDIA |
| 8 | partes | Añadir campo `aseguradora` (DAS/Onlygal/Otra) | Campo nuevo | BAJA |
| 9 | partes | Añadir campo `linkCashOutDevolucion` enlazando a cashflow (no a tabla deprecada) | Campo nuevo | MEDIA |
| 10 | cashflow | Reemplazar opción "DAS" por "Manual" en `sistemaPago` | Migración | ALTA |
| 11 | cashflow | Añadir "Cancelado" a opciones de `statusIns` y `statusOut` | Config | MEDIA |
| 12 | rentas | Migrar "La Caixa" → "Caixa" en `sistemaPago` | Migración | BAJA |
| 13 | cashflow | Deprecar campo duplicado `Transactions` (`fldVLoOdobs1Y1ByC`) | Limpieza | BAJA |

### Scripts nuevos necesarios

| # | Script | Trigger | Prioridad |
|---|--------|---------|-----------|
| 1 | `abrirParte.js` | Cashflow devuelto / impago detectado | ALTA |
| 2 | `ampliarParte.js` | Nuevo impago en balance con parte existente | ALTA |
| 3 | `registrarPagoDAS.js` | Transferencia DAS recibida en banco | ALTA |
| 4 | `recuperacionInquilino.js` | Inquilino paga deuda directamente | MEDIA |
| 5 | `cerrarParteSinRecuperacion.js` | Decisión manual de cierre | BAJA |

### Orden de implementación recomendado

```
FASE 1 — Schema (1-2 días)
  ├─ Cambios 1-3: Quitar prefersSingleRecordLink
  ├─ Cambios 4-9: Nuevos campos en partes
  ├─ Cambio 11: Añadir "Cancelado" a statusIns/statusOut
  └─ Verificar datos existentes

FASE 2 — Migración (1 día)
  ├─ Cambio 10: Migrar cashflows DAS → Caixa/Manual + sujeto=DAS
  ├─ Cambio 12: Migrar "La Caixa" → "Caixa" en rentas
  └─ Cambio 13: Migrar datos de campo duplicado Transactions

FASE 3 — Scripts core (3-5 días)
  ├─ Script 1: abrirParte.js
  ├─ Script 3: registrarPagoDAS.js
  └─ Script 2: ampliarParte.js

FASE 4 — Scripts complementarios (2-3 días)
  ├─ Script 4: recuperacionInquilino.js
  ├─ Script 5: cerrarParteSinRecuperacion.js
  └─ Actualizar cambiarSistemaPago.js para excluir DAS como sistema

FASE 5 — Validación (1-2 días)
  ├─ Verificar rollups y formulas calculadas
  ├─ Probar flujo completo: apertura → pago DAS → cierre
  └─ Probar flujo alternativo: apertura → recuperación inquilino → cierre
```

---

## APÉNDICE: FIELD IDs DE REFERENCIA

### Tabla partes (`tbl8iwwIepmAwmDmK`)
```
fldCw8Lf0X6i10hHg  index (formula)
fld4PVjHzmfBgCRsn  referenciaDAS
fldMFJPps6HrO7Eyt  status
fldH0XJ3p21Zy88V2  importe
fldAyaTDASeRJLX0a  linkMeses → rentas
fldpYFcbI1O6L5kkd  linkCashInIncidencia → cashflow
fldckKN76GQHPrqbk  linkCashInCompensacion → cashflow
flddHa4FAFOE1U3Ab  linkCashoutDevolucion → cashout (DEPRECATED)
fldqAL8aPx1fn5bFT  fechaCreacion
fldsNq3Y8Q3CtQqPd  dealBalance → balance
fldUaVepnSV1jWZAy  Notes
```

### Tabla cashflow (`tblxY6upsLDmqzaaL`) — campos DAS
```
fldotQmPpuqqkEkLI  linkDASParteIncidencia → partes
fld0VnYeDD63RRAta  linkDASParteCompensacion → partes
fldjNItVaCzrhlNhf  sistemaPago (Unnax|Caixa|DAS)
fldFyfq8PaqbCRgeN  statusIns (incluye "Recuperada vía DAS")
fld17mZxxLYPQfUzr  razon (Renta|Recobro|DAS)
fldazRk0SXXdqQo9L  sujeto (Pagador alquiler|DAS|Propietario)
fld656RBx2XkCHzR7  direccion (In|Out)
fldbkCQZwDR8a9kRP  importe
fldrquziQqJoTn08B  fechaProgramada
fld5eJ1zqTiT5DD1n  fechaPago
fldn69DhRftezHhcZ  metodoPago (SEPA|Transferencia|Tarjeta)
fldsTJCCfItHDoCgS  linkRenta → rentas
fldyCWFzrTMhWs7FT  linkDealBalance → balance
fldIL0Ox4naAhYeYM  linkTransactions → transactionsUnnax
fldz6bEbVOE6rc6zQ  linkTransactionsCaixa → Transactions (Caixa)
```
