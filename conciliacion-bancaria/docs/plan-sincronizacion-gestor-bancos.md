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

## 2. Mapeo de Campos entre Bases

### 2.1 Campos con nombre idéntico (43 campos compartidos)

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

### 2.2 Campos solo en Bancos (7 campos propios)
| Campo | Tipo | Propósito |
|-------|------|-----------|
| `fechaInicio` | date | Fecha inicio contrato (en Gestor: `fecha inicio`) |
| `fechaFin` | date | Fecha fin contrato (en Gestor: `fecha fin` es fórmula) |
| `comisionProductoAplicable` | percent | En Gestor: `comision producto aplicable` es fórmula |
| `crearBalance` | checkbox | Trigger para crear registros balance — solo Bancos |
| `linkBalance` | multipleRecordLinks | Relación interna de Bancos |
| `Transactions` | multipleRecordLinks | Relación interna de Bancos |
| `verGestor` | formula | Enlace URL al registro en Gestor |

### 2.3 Mapeo de campos con nombres diferentes
| Gestor (deal) | Bancos (deals) | Notas |
|---------------|----------------|-------|
| `fecha inicio` (`fldKjsVyd02EBLORV`) | `fechaInicio` (`fldG3rbkoMDbuxe7B`) | Mismo dato, nombre diferente |
| `fecha fin` fórmula (`fld93eNjPNwkEMGqD`) | `fechaFin` (`fldwlLcPivspceJZl`) | Gestor calcula, Bancos almacena |
| `comision producto aplicable` fórmula (`fldEQKxOM2RJJLEZx`) | `comisionProductoAplicable` (`fldW0Zd7ZGb9IxzW2`) | Gestor calcula, Bancos almacena |
| `fechaCierre` (`fld0jiP6k2LEvBLIk`) | `fechaCierre` (`fld0jiP6k2LEvBLIk`) | Ya sincronizado por nombre idéntico |

---

## 3. Dirección de la Sincronización

### 3.1 Gestor → Bancos (flujo principal, ya existente parcialmente)
**Trigger**: Cuando se crea o modifica un deal en el Gestor.

**Campos a sincronizar** (todos los 43 campos compartidos + 3 con nombre diferente):
- Datos contractuales: `alquiler mensual`, `tipo contrato`, `producto`, `fecha inicio` → `fechaInicio`, `fecha fin` → `fechaFin`
- Datos de cobro/pago: `gestionCobroSelect`, `receptorPago`, `pagadorServicio`, `cobroServicio`, `día cobro inq`, `día pago prop`
- Datos de partes: `linkPagador*`, `linkCobrador*`, `pagadorIBAN`, `pagadorNombre`
- Datos de póliza: `numero poliza`, `estado poliza`, `tipo poliza`, `fecha fin poliza`, `coberturaPoliza`, etc.
- Datos calculados: `ComisionProductoConIVA`, `comisionProductoAplicable`, `fechaFirmaSEPA`

### 3.2 Bancos → Gestor (flujo inverso, a implementar)
**Trigger**: Cuando se realizan cambios en Bancos que afectan al deal.

**Campos candidatos para sync inverso**:

| Campo en Bancos | → Campo en Gestor | Caso de uso |
|-----------------|-------------------|-------------|
| `fechaFirmaSEPA` | `fechaFirmaSEPA` (via docsExtra) | Cuando se firma el SEPA en el flujo bancario |
| `estado poliza` | `estado poliza` | Si se actualiza la póliza desde Bancos |
| `numero poliza` | `numero poliza` | Si se asigna póliza desde Bancos |
| `fecha fin poliza` | `fecha fin poliza` | Cambio de póliza |
| `poliza documento` | `poliza documento` | Upload de documento de póliza |
| `checkPolizaDocumento` | `checkPolizaDocumento` | Validación de póliza |

> **Nota importante**: La mayoría de campos que podrían necesitar sync inverso son los de **póliza de seguro**, ya que se gestionan a veces desde el contexto bancario.

---

## 4. Arquitectura de Sincronización Propuesta

### 4.1 Opción recomendada: Make (Integromat) como middleware

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

### 4.2 Scenarios de Make necesarios

#### Scenario 1: Gestor → Bancos (Crear/Actualizar deal)
```
Trigger: Airtable Webhook en base Gestor, tabla deal
  → Filtro: deal status = "ABIERTO" o "EN TRAMITE"
  → Buscar en Bancos por id_deal
  → IF existe:
      → Update record en Bancos deals con campos mapeados
    ELSE:
      → Create record en Bancos deals
      → Guardar recordID del Gestor en campo recordID de Bancos
  → Log resultado
```

**Campos a sincronizar (Gestor → Bancos)**:
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

#### Scenario 2: Bancos → Gestor (Sync inverso — cambios en conciliación)
```
Trigger: Airtable Webhook en base Bancos, tabla deals
  → Filtro: campo modificado ∈ [campos_sync_inverso]
  → Leer recordID del campo recordID (= Record ID en Gestor)
  → IF recordID existe:
      → Update record en Gestor deal
  → Log resultado
```

**Campos para sync inverso (Bancos → Gestor)**:

| Campo Bancos | Campo Gestor | Condición |
|-------------|-------------|-----------|
| `estado poliza` | `estado poliza` | Siempre |
| `numero poliza` | `numero poliza` | Siempre |
| `tipo poliza` | `tipo poliza` | Siempre |
| `fecha fin poliza` | `fecha fin poliza` | Siempre |
| `coberturaPoliza` | `coberturaPoliza` | Siempre |
| `polizaCoberturaPorcentaje` | `polizaCoberturaPorcentaje` | Siempre |
| `poliza documento` | `poliza documento` | Siempre |
| `checkPolizaDocumento` | `checkPolizaDocumento` | Siempre |
| `driveDocIDPoliza` | `driveDocIDPoliza` | Siempre |

> **Decisión pendiente**: ¿Hay más campos que se modifiquen en Bancos y deban reflejarse en el Gestor? (ej: `día cobro inq`, `día pago prop`, `alquiler mensual`, `gestionCobroSelect`...)

#### Scenario 3: Bancos → Gestor (Eventos de conciliación)
```
Trigger: Cambio en tabla balance/cashflow/transactionsUnnax
  → Cuando un cashflow pasa a estado "cobrado" o "pagado"
  → Actualizar campo de estado correspondiente en Gestor
  → (Opcional) Actualizar stopCobroInquilino en Gestor
```

### 4.3 Prevención de loops infinitos

**Problema**: Si Gestor actualiza Bancos y eso dispara el webhook de Bancos que actualiza Gestor, se crea un loop.

**Soluciones**:

1. **Campo de control `syncSource`** (recomendado):
   - Añadir campo `_syncSource` (singleLineText) en ambas tablas
   - El scenario que escribe pone `_syncSource = "make-sync"`
   - El webhook filtra: `IF _syncSource = "make-sync" → ignorar`
   - Después del filtro, limpiar `_syncSource`

2. **Timestamp de última sincronización**:
   - Campo `_lastSyncAt` (dateTime) en ambas tablas
   - Comparar `lastModifiedTime` con `_lastSyncAt`
   - Solo sincronizar si `lastModifiedTime > _lastSyncAt`

3. **Campo `_syncLock`** (checkbox):
   - Activar antes de escribir, desactivar después
   - Webhook ignora registros con `_syncLock = true`

**Recomendación**: Usar opción 1 (`_syncSource`) por simplicidad y fiabilidad.

---

## 5. Gestión de la Cadena de Datos en Bancos

Cuando un deal se crea/actualiza en Bancos, hay una cadena de registros que se generan:

```
deals ──→ balance ──→ rentas ──→ cashflow ──→ transactionsUnnax
```

### 5.1 Creación inicial (Gestor → Bancos: nuevo deal)
1. **Scenario Make** crea registro en `deals` de Bancos
2. **Automatización Airtable** (existente) con `crearBalance = true`:
   - Crea registros de `balance` por cada mes del contrato
   - Cada balance genera `rentas` según el tipo de deal
   - Cada renta genera `cashflows` de cobro y pago
3. Los cashflows se enlazan a `transactionsUnnax` cuando se procesan

### 5.2 Actualización (Gestor → Bancos: cambio de deal)
**Campos que desencadenan recálculos en Bancos**:

| Campo modificado | Impacto en Bancos |
|-----------------|-------------------|
| `alquiler mensual` | Recalcular rentas y cashflows futuros (script `actualizarPrecioRentas.js`) |
| `fechaFin` / `mesesExtension` | Crear/eliminar balances y rentas futuros (script `cancelarRentasFuturas.js`) |
| `día cobro inq` / `día pago prop` | Actualizar fechas de cashflows futuros |
| `gestionCobroSelect` | Cambiar sistema de pago (script `cambiarSistemaPago.js`) |
| `ComisionProductoConIVA` | Recalcular rentas de comisión |

**Recomendación**: Los Scenarios de Make deben detectar qué campo cambió y disparar el script de Airtable correspondiente.

### 5.3 Sync inverso (Bancos → Gestor)
**Eventos en Bancos que deben notificarse al Gestor**:

| Evento en Bancos | Acción en Gestor |
|-----------------|------------------|
| Póliza actualizada (estado, número, doc) | Actualizar campos de póliza en deal |
| Todos los cashflows de un mes cobrados | (Opcional) Marcar estado de cobro en deal |
| Cambio sistema de pago completado | (Opcional) Confirmar en deal |
| SEPA firmado (fechaFirmaSEPA) | Actualizar fecha firma SEPA |

---

## 6. Implementación por Fases

### Fase 1: Sync Gestor → Bancos (crear deals)
- Crear Scenario Make con webhook en Gestor
- Implementar creación de deal en Bancos con todos los campos mapeados
- Usar `id_deal` como clave de búsqueda para upsert
- Añadir campo `_syncSource` en ambas bases
- **Validación**: Crear deal en Gestor → verificar que aparece en Bancos

### Fase 2: Sync Gestor → Bancos (actualizar deals)
- Ampliar Scenario para detectar updates
- Implementar lógica de detección de campos cambiados
- Para cambios en `alquiler mensual`: disparar script `actualizarPrecioRentas`
- Para cambios en `fechaFin`: disparar script `cancelarRentasFuturas`
- **Validación**: Modificar precio en Gestor → verificar recálculo en Bancos

### Fase 3: Sync Bancos → Gestor (pólizas)
- Crear Scenario Make con webhook en Bancos tabla deals
- Filtrar solo cambios en campos de póliza
- Actualizar deal en Gestor vía API
- Implementar prevención de loops
- **Validación**: Actualizar póliza en Bancos → verificar en Gestor

### Fase 4: Sync Bancos → Gestor (eventos de conciliación)
- Webhook en tabla cashflow/transactionsUnnax
- Notificar al Gestor sobre estados de cobro/pago
- **Validación**: Marcar cobro completado → verificar notificación en Gestor

---

## 7. Campos de Control a Crear

### En Gestor (deal)
| Campo | Tipo | Propósito |
|-------|------|-----------|
| `_syncSource` | singleLineText | Identifica origen de última escritura |
| `_syncBancosRecordID` | singleLineText | Record ID del deal correspondiente en Bancos |
| `_lastSyncAt` | dateTime | Timestamp de última sincronización |

### En Bancos (deals)
| Campo | Tipo | Propósito |
|-------|------|-----------|
| `_syncSource` | singleLineText | Identifica origen de última escritura |
| `_lastSyncAt` | dateTime | Timestamp de última sincronización |

> El campo `recordID` ya existente en Bancos cumple la función de `_syncGestorRecordID`.

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

## 9. Resumen de Decisiones Pendientes

1. **¿Qué campos adicionales deben sincronizarse de Bancos → Gestor?** (más allá de pólizas)
2. **¿Se deben sincronizar cambios en `día cobro inq`, `día pago prop` o `alquiler mensual` de vuelta al Gestor?**
3. **¿Qué eventos de conciliación (cobro completado, pago realizado) deben notificarse al Gestor?**
4. **¿Se usa Make o se implementa un servicio propio?** (recomendado: Make por la infraestructura existente)
5. **¿Se activa la creación automática de balance (`crearBalance`) desde el Scenario o se mantiene manual?**
