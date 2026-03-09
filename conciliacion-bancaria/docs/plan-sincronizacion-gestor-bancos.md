# Plan de Sincronización: Gestor de Operaciones ↔ Conciliación Bancaria

## 1. Contexto

### Bases de Airtable
| Base | ID | Tabla principal | Campos |
|------|----|-----------------|--------|
| **Advancing** (Gestor de Operaciones) | `appuV5kGKzKdXlhoR` | `deal` (`tblwx73iceuKNaz68`) | 495 |
| **Bancos - ADV** (Conciliación Bancaria) | `appuGDs3spnRAvc61` | `deals` (`tblWnB9SCfCFoXzfW`) | 50 |

### Relación actual
- La tabla `deals` de Bancos **se alimenta** de la tabla `deal` del Gestor.
- El campo `recordID` en Bancos almacena el Record ID del deal en el Gestor.
- El campo `verGestor` en Bancos genera un enlace directo al registro del Gestor usando ese `recordID`.
- El campo `id_deal` es el identificador común de negocio entre ambas bases.
- **No existe sincronización automática** actualmente: los datos se copian manualmente o vía automatizaciones puntuales en Make.

### Flujo de datos actual
```
Gestor (deal) ──[copia manual/Make]──→ Bancos (deals)
                                          │
                                          ├──→ balance (linkDeal)
                                          ├──→ rentas (via balance)
                                          ├──→ cashflow (via balance)
                                          ├──→ transactionsUnnax (via cashflow)
                                          └──→ partes (via balance)
```

---

## 2. Ownership de Datos (Decisiones Confirmadas)

### Principio general
Cada dato tiene un **único owner** que es la fuente de verdad. La mayoría de datos se informan una sola vez desde el Gestor al dar de alta el deal en Bancos. Después, durante la vida del deal, muy pocos campos necesitan sincronización continua.

### Tabla de ownership

| Categoría | Campos | Owner | Dirección sync | Cuándo |
|-----------|--------|-------|----------------|--------|
| **Datos contractuales** | `alquiler mensual`, `tipo contrato`, `producto`, `fecha inicio`, `fecha fin`, `fecha firma`, `mesesExtension`, `fechaCierre`, `comisionProductoAplicable`, `ComisionProductoConIVA` | Gestor | Gestor → Bancos | Solo al crear deal |
| **Cobro y pago** | `gestionCobroSelect`, `gestionCobro`, `receptorPago`, `cobroServicio`, `pagadorServicio`, `día cobro inq`, `día pago prop`, `apoyoFechaPago`, `diasServicio` | Gestor | Gestor → Bancos | Solo al crear deal |
| **Datos de partes** | `linkPagador*`, `linkCobrador*`, `pagadorIBAN`, `pagadorNombre*`, `direccion inmueble` | Gestor | Gestor → Bancos | Solo al crear deal (se informan antes del alta bancaria) |
| **Póliza** | `numero poliza`, `estado poliza`, `tipo poliza`, `fecha fin poliza`, `coberturaPoliza`, `polizaCoberturaPorcentaje`, `polizaCosteCalculo`, `poliza documento`, `checkPolizaDocumento`, `driveDocIDPoliza` | Gestor | Gestor → Bancos | Al crear + cuando cambie (renovaciones, etc.) |
| **Identificadores** | `id_deal`, `recordID`, `indexDeal`, `canal de entrada`, `fechaFirmaSEPA` | Gestor | Gestor → Bancos | Solo al crear deal |
| **Stop cobro inquilino** | `stopCobroInquilino` | Conciliación | Bancos → Gestor | Cuando se para la operativa en conciliación |
| **Estado operativo** | `estadoBancario` (nuevo campo) | Conciliación | Bancos → Gestor | Resumen actualizado continuamente |
| **Cambio de precio** | `alquiler mensual` | Conciliación | Bancos → Gestor | Cuando se ejecuta `actualizarPrecioRentas` |
| **Cambio sistema pago** | Script `cambiarSistemaPago` | Conciliación | Solo en Bancos | No se sincroniza de vuelta |

### Campos que NO se sincronizan de vuelta al Gestor
- `fechaFin` — inmutable tras el alta
- `mesesExtension` — inmutable tras el alta
- `tipo contrato` — crear otro deal si cambia
- `fechaCierre` — inmutable
- `ComisionProductoConIVA` / comisiones — inmutables
- `día cobro inq`, `día pago prop` — inmutables en Gestor
- `gestionCobroSelect` — los cambios de sistema de pago solo viven en Bancos
- Datos de partes — inmutables durante la vida del deal

---

## 3. Mapeo de Campos entre Bases

### 3.1 Campos con nombre idéntico (43 campos compartidos)

#### Tipo compatible (25 campos) — sincronización directa
| Campo | Tipo | Gestor Field ID | Bancos Field ID |
|-------|------|-----------------|-----------------|
| `alquiler mensual` | currency | `fldTJIw17zLdUiXDH` | `fldZE4Q0citWseonB` |
| `apoyoFechaPago` | singleLineText | `fld1aPPZ0ljXcK1uy` | `fld4MyXShWVn7pWZF` |
| `canal de entrada` | singleSelect | `fldx8tZ0tQv3K8QQS` | `fld7hwcN9ZluC4ZH4` |
| `checkPolizaDocumento` | checkbox | `fldFqQw6LJULpHSso` | `fldkdJXBwtElGqNtu` |
| `coberturaPoliza` | currency | `fldzRvOj2GdPnr1YG` | `fldCEPgWrndGlQRF0` |
| `cobroServicio` | singleSelect | `fldGMS9D8snb2hIg8` | `fldxdjQwDUbL6sAyp` |
| `diasServicio` | number | `flds8KW0YUrkdq79o` | `fldqGop9T6s0OZVnl` |
| `driveDocIDPoliza` | singleLineText | `fldaIWjLNMv4uLV8t` | `fldR4mD8TOypHYleq` |
| `día cobro inq` | number | `fldqAtHPmta4zy90y` | `fldXjiHD6pucRY8qj` |
| `día pago prop` | number | `fldQtQNfqBuEG5SSK` | `fldX62V2qRvY0X7ni` |
| `estado poliza` | singleSelect | `flda9FhYRTTAn09xa` | `fld74RowcmOZGGwjN` |
| `fecha fin poliza` | date | `fldT0OenFvF4o4Brv` | `fldX7LYShpPYbTi7i` |
| `fecha firma` | date | `fldGkHSKXD6eLWvfp` | `fld5qwuHLd8V4lGYA` |
| `gestionCobro` | singleLineText | `fldc5F2kGnbhnwB8F` | `fldPbpIHfK39bGZl2` |
| `gestionCobroSelect` | singleSelect | `fldY1Vtx9gJ8DbR4A` | `fldDH2gmTeqPrDZms` |
| `id_deal` | singleLineText | `fldnvZWV2jyROqgGl` | `fldVa3bfj7ej1vb1J` |
| `mesesExtension` | number | `fldBUGPoZ7VdS80ys` | `fldPC4OfiKRfHsoKT` |
| `numero poliza` | singleLineText | `fldBnA2Lviq4mECoG` | `fldCulx3TI4WbvVUF` |
| `pagadorServicio` | singleSelect | `fldeFmdWNYbRZIUID` | `fldDUjy7jrW8rYdDo` |
| `poliza documento` | multipleAttachments | `fldip7vHx9cQIIiRh` | `fldOWMoUj9PcRYoCk` |
| `polizaCoberturaPorcentaje` | percent | `fldRNNbL6QN12Kenx` | `fld0KQVdEluuE8dDb` |
| `producto` | singleSelect | `fldNJPepRJ6UU0jVj` | `fldzmHafdScDXvVy9` |
| `receptorPago` | singleSelect | `fldgMzmQ3C2mYvMoP` | `fldtQtkMTeXaqNMVC` |
| `tipo contrato` | singleSelect | `fld1Cd6hfFHO7WwQq` | `fldPCuSq6EJJnVbPg` |
| `tipo poliza` | singleSelect | `fldd6DMIQ9ILTNrud` | `fldbPGPyt4Iy9vSBY` |

#### Tipo diferente (18 campos) — requieren transformación
| Campo | Tipo Gestor | Tipo Bancos | Estrategia |
|-------|-------------|-------------|------------|
| `indexDeal` | formula | multilineText | Copiar valor resultante de fórmula → texto |
| `recordID` | formula | multilineText | Copiar RECORD_ID() del gestor → texto |
| `ComisionProductoConIVA` | formula | currency | Copiar valor calculado → currency |
| `polizaCosteCalculo` | formula | currency | Copiar valor calculado → currency |
| `fechaFirmaSEPA` | formula | dateTime | Copiar valor calculado → dateTime |
| `direccion inmueble` | multipleLookupValues | singleLineText | Copiar primer valor del lookup → texto |
| `pagadorIBAN` | multipleLookupValues | singleLineText | Copiar primer valor del lookup → texto |
| `pagadorNombre` | multipleLookupValues | singleLineText | Copiar primer valor del lookup → texto |
| `pagadorNombreCompleto` | multipleLookupValues | singleLineText | Copiar primer valor del lookup → texto |
| `linkPagador` | multipleRecordLinks | singleLineText | Copiar nombre/ID del contacto → texto |
| `linkPagadorNombreCompleto` | multipleLookupValues | singleLineText | Copiar valor → texto |
| `linkPagadorNumeroCuenta` | multipleLookupValues | singleLineText | Copiar valor → texto |
| `linkPagadorNumeroDocumento` | multipleLookupValues | singleLineText | Copiar valor → texto |
| `linkCobrador` | multipleRecordLinks | singleLineText | Copiar nombre/ID del contacto → texto |
| `linkCobradorNombreCompleto` | multipleLookupValues | singleLineText | Copiar valor → texto |
| `linkCobradorNumeroDeCuenta` | multipleLookupValues | singleLineText | Copiar valor → texto |
| `linkCobradorNumeroDocumento` | multipleLookupValues | singleLineText | Copiar valor → texto |
| `linkCobradorSwiftBIC` | multipleLookupValues | singleLineText | Copiar valor → texto |

### 3.2 Campos solo en Bancos (7 campos propios)
| Campo | Tipo | Propósito |
|-------|------|-----------|
| `fechaInicio` | date | Fecha inicio contrato (en Gestor: `fecha inicio`) |
| `fechaFin` | date | Fecha fin contrato (en Gestor: `fecha fin` es fórmula) |
| `comisionProductoAplicable` | percent | En Gestor: `comision producto aplicable` es fórmula |
| `crearBalance` | checkbox | Trigger para crear registros balance — solo Bancos |
| `linkBalance` | multipleRecordLinks | Relación interna de Bancos |
| `Transactions` | multipleRecordLinks | Relación interna de Bancos |
| `verGestor` | formula | Enlace URL al registro en Gestor |

### 3.3 Mapeo de campos con nombres diferentes
| Gestor (deal) | Bancos (deals) | Notas |
|---------------|----------------|-------|
| `fecha inicio` (`fldKjsVyd02EBLORV`) | `fechaInicio` (`fldG3rbkoMDbuxe7B`) | Mismo dato, nombre diferente |
| `fecha fin` fórmula (`fld93eNjPNwkEMGqD`) | `fechaFin` (`fldwlLcPivspceJZl`) | Gestor calcula, Bancos almacena |
| `comision producto aplicable` fórmula (`fldEQKxOM2RJJLEZx`) | `comisionProductoAplicable` (`fldW0Zd7ZGb9IxzW2`) | Gestor calcula, Bancos almacena |

### 3.4 Campos nuevos a crear

#### En Gestor (deal)
| Campo | Tipo | Propósito |
|-------|------|-----------|
| `_syncSource` | singleLineText | Identifica origen de última escritura (prevención de loops) |
| `_syncBancosRecordID` | singleLineText | Record ID del deal correspondiente en Bancos |
| `estadoBancario` | singleSelect | Resumen del estado operativo en conciliación |
| `stopCobroInquilino` | checkbox/singleSelect | Ya puede existir — se actualiza desde Bancos |

#### En Bancos (deals)
| Campo | Tipo | Propósito |
|-------|------|-----------|
| `_syncSource` | singleLineText | Identifica origen de última escritura (prevención de loops) |

> El campo `recordID` ya existente en Bancos cumple la función de enlace con el Gestor.

### 3.5 Campo `estadoBancario` — Resumen de estado operativo

Este campo en el **Gestor** permite al equipo de gestión ver el estado de cada deal en conciliación sin entrar en Bancos.

**Valores posibles**:
| Valor | Significado |
|-------|-------------|
| `Al corriente` | Todos los cobros y pagos al día |
| `Cobro pendiente` | Hay cobros pendientes de procesar |
| `Pago pendiente` | Hay pagos pendientes de procesar |
| `Con incidencias` | Existen devoluciones u otros problemas |
| `Stop cobro` | Se ha parado el cobro al inquilino |
| `Cerrado` | Deal cerrado en conciliación |

> **Nota**: Los valores exactos se definirán durante la implementación según los estados reales del flujo de conciliación.

---

## 4. Dirección de la Sincronización

### 4.1 Gestor → Bancos: Alta de deal (flujo principal)
**Trigger**: Cuando un deal en el Gestor pasa a estado listo para alta bancaria.

**Todos los campos mapeados** (43 compartidos + 3 con nombre diferente) se copian una sola vez al crear el deal en Bancos.

### 4.2 Gestor → Bancos: Actualización de póliza (flujo continuo)
**Trigger**: Cuando cambian campos de póliza en el Gestor.

**Campos**: `numero poliza`, `estado poliza`, `tipo poliza`, `fecha fin poliza`, `coberturaPoliza`, `polizaCoberturaPorcentaje`, `polizaCosteCalculo`, `poliza documento`, `checkPolizaDocumento`, `driveDocIDPoliza`.

### 4.3 Bancos → Gestor: Stop cobro + estado operativo
**Trigger**: Cuando cambia `stopCobroInquilino` o se recalcula el estado operativo del deal.

**Campos**:
| Campo Bancos | → Campo Gestor | Caso de uso |
|--------------|----------------|-------------|
| `stopCobroInquilino` | `stopCobroInquilino` | Cuando se para/reanuda la operativa de cobro |
| `alquiler mensual` | `alquiler mensual` | Cuando se actualiza el precio en Bancos |
| (calculado) | `estadoBancario` | Resumen del estado del deal en conciliación |

### 4.4 Operaciones solo en Bancos (sin sync de vuelta)
Estos cambios ocurren en conciliación y **no necesitan reflejarse en el Gestor**:
- **Cambio de sistema de pago** (`cambiarSistemaPago.js`) — modifica método de cobro/pago
- **Cancelación de rentas futuras** (`cancelarRentasFuturas.js`) — ajusta balance

> **Nota**: El **cambio de precio** (`actualizarPrecioRentas.js`) sí se sincroniza de vuelta: el nuevo `alquiler mensual` se envía al Gestor.

---

## 5. Arquitectura de Sincronización

### 5.1 Opción recomendada: Make (Integromat) como middleware

```
┌─────────────┐    Webhook     ┌──────────┐    API       ┌─────────────┐
│   Gestor    │───────────────→│   Make   │─────────────→│   Bancos    │
│ (Advancing) │                │ Scenario │              │ (Bancos-ADV)│
│             │←───────────────│          │←─────────────│             │
└─────────────┘    API         └──────────┘   Webhook    └─────────────┘
```

**Justificación**:
- Ya existe infraestructura Make en el stack actual (webhooks de contratos, SEPA, Unnax)
- Airtable tiene webhooks nativos (no polling) para detectar cambios
- Make gestiona transformaciones de datos y manejo de errores
- Visibilidad y logs centralizados

### 5.2 Scenarios de Make necesarios

#### Scenario 1: Alta de deal (Gestor → Bancos)
```
Trigger: Airtable Webhook en base Gestor, tabla deal
  → Filtro: deal pasa a estado "listo para alta bancaria"
  → Buscar en Bancos por id_deal (para evitar duplicados)
  → IF no existe:
      → Create record en Bancos deals con TODOS los campos mapeados
      → Guardar recordID del Gestor en campo recordID de Bancos
      → Guardar Record ID de Bancos en _syncBancosRecordID del Gestor
      → Marcar _syncSource = "make-sync" en Bancos
  → Log resultado
```

**Payload de creación (Gestor → Bancos)**:
```json
{
  "indexDeal": "{{gestor.indexDeal}}",
  "id_deal": "{{gestor.id_deal}}",
  "recordID": "{{gestor.RECORD_ID}}",
  "canal de entrada": "{{gestor.canal_de_entrada}}",
  "alquiler mensual": "{{gestor.alquiler_mensual}}",
  "tipo contrato": "{{gestor.tipo_contrato}}",
  "producto": "{{gestor.producto}}",
  "fechaInicio": "{{gestor.fecha_inicio}}",
  "fechaFin": "{{gestor.fecha_fin}}",
  "fecha firma": "{{gestor.fecha_firma}}",
  "gestionCobro": "{{gestor.gestionCobro}}",
  "gestionCobroSelect": "{{gestor.gestionCobroSelect}}",
  "receptorPago": "{{gestor.receptorPago}}",
  "cobroServicio": "{{gestor.cobroServicio}}",
  "pagadorServicio": "{{gestor.pagadorServicio}}",
  "día cobro inq": "{{gestor.dia_cobro_inq}}",
  "día pago prop": "{{gestor.dia_pago_prop}}",
  "apoyoFechaPago": "{{gestor.apoyoFechaPago}}",
  "diasServicio": "{{gestor.diasServicio}}",
  "direccion inmueble": "{{gestor.direccion_inmueble[0]}}",
  "comisionProductoAplicable": "{{gestor.comision_producto_aplicable}}",
  "ComisionProductoConIVA": "{{gestor.ComisionProductoConIVA}}",
  "pagadorNombre": "{{gestor.pagadorNombre[0]}}",
  "pagadorNombreCompleto": "{{gestor.pagadorNombreCompleto[0]}}",
  "pagadorIBAN": "{{gestor.pagadorIBAN[0]}}",
  "linkPagador": "{{gestor.linkPagador[0]}}",
  "linkPagadorNombreCompleto": "{{gestor.linkPagadorNombreCompleto[0]}}",
  "linkPagadorNumeroCuenta": "{{gestor.linkPagadorNumeroCuenta[0]}}",
  "linkPagadorNumeroDocumento": "{{gestor.linkPagadorNumeroDocumento[0]}}",
  "linkCobrador": "{{gestor.linkCobrador[0]}}",
  "linkCobradorNombreCompleto": "{{gestor.linkCobradorNombreCompleto[0]}}",
  "linkCobradorNumeroDeCuenta": "{{gestor.linkCobradorNumeroDeCuenta[0]}}",
  "linkCobradorNumeroDocumento": "{{gestor.linkCobradorNumeroDocumento[0]}}",
  "linkCobradorSwiftBIC": "{{gestor.linkCobradorSwiftBIC[0]}}",
  "numero poliza": "{{gestor.numero_poliza}}",
  "estado poliza": "{{gestor.estado_poliza}}",
  "tipo poliza": "{{gestor.tipo_poliza}}",
  "fecha fin poliza": "{{gestor.fecha_fin_poliza}}",
  "coberturaPoliza": "{{gestor.coberturaPoliza}}",
  "polizaCoberturaPorcentaje": "{{gestor.polizaCoberturaPorcentaje}}",
  "polizaCosteCalculo": "{{gestor.polizaCosteCalculo}}",
  "poliza documento": "{{gestor.poliza_documento}}",
  "checkPolizaDocumento": "{{gestor.checkPolizaDocumento}}",
  "driveDocIDPoliza": "{{gestor.driveDocIDPoliza}}",
  "mesesExtension": "{{gestor.mesesExtension}}",
  "fechaFirmaSEPA": "{{gestor.fechaFirmaSEPA}}"
}
```

#### Scenario 2: Actualización de póliza (Gestor → Bancos)
```
Trigger: Airtable Webhook en base Gestor, tabla deal
  → Filtro: campo modificado ∈ [campos de póliza]
  → Buscar en Bancos por id_deal
  → IF existe:
      → Update SOLO campos de póliza en Bancos
      → Marcar _syncSource = "make-sync" en Bancos
  → Log resultado
```

**Campos de póliza a sincronizar**:
```json
{
  "numero poliza": "{{gestor.numero_poliza}}",
  "estado poliza": "{{gestor.estado_poliza}}",
  "tipo poliza": "{{gestor.tipo_poliza}}",
  "fecha fin poliza": "{{gestor.fecha_fin_poliza}}",
  "coberturaPoliza": "{{gestor.coberturaPoliza}}",
  "polizaCoberturaPorcentaje": "{{gestor.polizaCoberturaPorcentaje}}",
  "polizaCosteCalculo": "{{gestor.polizaCosteCalculo}}",
  "poliza documento": "{{gestor.poliza_documento}}",
  "checkPolizaDocumento": "{{gestor.checkPolizaDocumento}}",
  "driveDocIDPoliza": "{{gestor.driveDocIDPoliza}}"
}
```

#### Scenario 3: Stop cobro + estado operativo (Bancos → Gestor)
```
Trigger: Airtable Webhook en base Bancos, tabla deals
  → Filtro: campo modificado = stopCobroInquilino
  → Leer recordID (= Record ID en Gestor)
  → IF recordID existe:
      → Update stopCobroInquilino en Gestor
      → Marcar _syncSource = "make-sync" en Gestor
  → Log resultado
```

```
Trigger: Cambio en tabla balance/cashflow (periódico o por evento)
  → Calcular estado operativo del deal:
      - ¿Hay cobros pendientes? ¿Pagos pendientes? ¿Devoluciones? ¿Stop cobro?
  → IF estado ha cambiado:
      → Update estadoBancario en Gestor
      → Marcar _syncSource = "make-sync" en Gestor
  → Log resultado
```

### 5.3 Prevención de loops infinitos

**Problema**: Si Gestor actualiza Bancos y eso dispara el webhook de Bancos que actualiza Gestor, se crea un loop.

**Solución recomendada: Campo de control `_syncSource`**:
- Añadir campo `_syncSource` (singleLineText) en ambas tablas
- El Scenario que escribe pone `_syncSource = "make-sync"`
- El webhook filtra: `IF _syncSource = "make-sync" → ignorar`
- Después del filtro, limpiar `_syncSource`

> Con la arquitectura actual (la mayoría de campos solo se escriben al crear y póliza es unidireccional), el riesgo de loops es muy bajo. Solo `stopCobroInquilino` es bidireccional en teoría, pero en la práctica solo se escribe desde Bancos.

---

## 6. Gestión de la Cadena de Datos en Bancos

Cuando un deal se crea en Bancos, hay una cadena de registros que se generan:

```
deals ──→ balance ──→ rentas ──→ cashflow ──→ transactionsUnnax
```

### 6.1 Creación inicial (Gestor → Bancos: nuevo deal)
1. **Scenario Make** crea registro en `deals` de Bancos con todos los campos
2. **Automatización Airtable** (existente) con `crearBalance = true`:
   - Crea registros de `balance` por cada mes del contrato
   - Cada balance genera `rentas` según el tipo de deal
   - Cada renta genera `cashflows` de cobro y pago
3. Los cashflows se enlazan a `transactionsUnnax` cuando se procesan

### 6.2 Operaciones durante la vida del deal (solo en Bancos)
Estas operaciones se disparan desde la interfaz de conciliación y **no requieren sync con el Gestor**:

| Operación | Script | Impacto |
|-----------|--------|---------|
| Cambio de precio | `actualizarPrecioRentas.js` | Recalcula rentas y cashflows futuros |
| Cambio sistema de pago | `cambiarSistemaPago.js` | Cambia método de cobro/pago |
| Cancelar rentas futuras | `cancelarRentasFuturas.js` | Ajusta balance por finalización anticipada |

### 6.3 Actualización de póliza (Gestor → Bancos)
Cuando se renueva o modifica la póliza en el Gestor, el Scenario 2 actualiza los campos de póliza en Bancos. **No afecta** a la cadena balance/rentas/cashflow.

---

## 7. Implementación por Fases

### Fase 1: Alta de deal (Gestor → Bancos)
**Objetivo**: Automatizar la creación de deals en Bancos cuando se dan de alta en el Gestor.

- Crear Scenario 1 en Make con webhook en Gestor
- Implementar creación de deal en Bancos con todos los campos mapeados
- Usar `id_deal` como clave de búsqueda para evitar duplicados
- Añadir campo `_syncSource` en ambas bases
- Añadir campo `_syncBancosRecordID` en Gestor
- **Validación**: Crear deal en Gestor → verificar que aparece en Bancos con todos los datos

### Fase 2: Sync de póliza (Gestor → Bancos)
**Objetivo**: Mantener los datos de póliza sincronizados.

- Crear Scenario 2 en Make con webhook en Gestor filtrado a campos de póliza
- Implementar update parcial (solo campos de póliza) en Bancos
- **Validación**: Modificar póliza en Gestor → verificar actualización en Bancos

### Fase 3: Stop cobro y estado operativo (Bancos → Gestor)
**Objetivo**: Dar visibilidad al Gestor sobre el estado operativo.

- Crear campo `estadoBancario` (singleSelect) en Gestor
- Crear Scenario 3 en Make:
  - Webhook en Bancos para `stopCobroInquilino` → actualizar Gestor
  - Lógica para calcular `estadoBancario` y actualizarlo en Gestor
- Implementar prevención de loops con `_syncSource`
- **Validación**: Activar stop cobro en Bancos → verificar campo en Gestor

### Fase 4: Refinamiento del estado operativo
**Objetivo**: Afinar la lógica de cálculo del estado operativo.

- Definir reglas exactas para cada valor de `estadoBancario`
- Implementar cálculo basado en tablas balance/cashflow
- Ajustar frecuencia de actualización (por evento vs. periódico)
- **Validación**: Verificar que el resumen refleja correctamente el estado real

---

## 8. Consideraciones Técnicas

### Rate Limits de Airtable
- **API**: 5 requests/segundo por base
- **Webhooks**: Los webhooks de Airtable envían notificaciones, no el record completo. El Scenario debe hacer un GET del registro después.
- **Batch updates**: Usar batch endpoint (hasta 10 records por request) cuando sea posible

### Manejo de errores
- Reintentos automáticos en Make (3 intentos con backoff exponencial)
- Logging en tabla `logs` de Bancos para auditoría
- Notificación por email/Slack si falla la sync después de reintentos

### Datos sensibles
- Los IBANs y datos personales (nombre, documento) se transfieren entre bases
- Asegurar que los Personal Access Tokens tengan los permisos mínimos necesarios
- No loggear datos personales completos (enmascarar IBANs en logs)

---

## 9. Resumen

### Decisiones confirmadas
1. **La mayoría de datos se copian una sola vez** al dar de alta el deal en Bancos — no hay sync continuo
2. **La póliza es el único grupo de campos** con sync continuo Gestor → Bancos
3. **Solo `stopCobroInquilino`** se sincroniza de Bancos → Gestor
4. **El estado operativo** se muestra en el Gestor como campo resumen `estadoBancario` (un campo singleSelect por deal)
5. **Cambios de precio y sistema de pago** son operaciones exclusivas de Bancos, no se reflejan en el Gestor
6. **Los datos de partes** se informan por el gestor antes del alta bancaria y no cambian durante la vida del deal
7. **Make** como middleware de sincronización (infraestructura existente)
8. **`_syncSource`** como mecanismo de prevención de loops

### Sin decisiones pendientes
Todas las decisiones de ownership y dirección de datos han sido confirmadas.
