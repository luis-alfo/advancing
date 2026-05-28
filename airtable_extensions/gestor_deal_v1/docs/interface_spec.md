# Spec de la interfaz "Detalle deal DIC25" — inventario para replicar

> Fuente: extracción del DOM de la record review page `pagbyyPyyYM2epGOK`
> (base `appuV5kGKzKdXlhoR`, tabla `deal` = `tblwx73iceuKNaz68`, 500 campos).
> Deal de muestra: `recdEihfmaTqj2clC`. Fecha de extracción: 2026-05-28.

## Hechos clave

- La página es **una sola** record review page con **22 secciones** navegables por pestañas-ancla.
- Tiene **97 widgets** de campo + **10 botones** (CTA / linked-record actions).
- ⚠️ **Las etiquetas visibles NO son los nombres de campo.** Solo 4/48 etiquetas coincidían con un nombre de campo real (trampa #1 de Galiwonders). El binding `label → fieldId` debe confirmarse en el **editor** sección por sección antes de codificar cada `getCellValue`.
- Los webhooks de Make aparecen como **valores de campos `formula`** del propio deal (p. ej. `webhookDriveMoveContrato`, `urlConciliacionBancaria`), no como configuración de la interfaz.

## Botones / acciones (10)

| Botón | Tipo | Acción |
|---|---|---|
| Crear carpetas | button field | Abre URL (Drive vía Make, probablemente) |
| Hubspot | button field | Abre el deal en HubSpot |
| Nuevo propietario | linked-record "create" | Crea registro en `contactos` vinculado |
| Añadir propietario existente | linked-record "add" | Vincula contacto existente |
| Nuevo inquilino / Añadir inquilino existente | linked-record | idem |
| Añadir avalista | linked-record | idem |
| Nuevo estudio | linked-record | Crea registro en `estudios` (Scoring Affi) |
| Ver en Bancos | button/url | Abre el deal en base Bancos-ADV `appuGDs3spnRAvc61` |
| Eliminar | acción | Borrado (sección Sincronización bancaria) |

## Inventario ordenado de widgets (tipo DOM :: label visible)

> `columntype` del DOM. Mapea a tipo de campo Airtable: `text`→singleLineText, `select`→singleSelect,
> `foreignKey`→multipleRecordLinks/lookup, `count`→count, `number`→number/percent/currency, `formula`→formula.

### 1. Datos básicos
```
formula   :: (título/index)
text      :: Hubspot Deal ID
foreignKey:: Owner
select    :: Producto
select    :: Tipo contrato
select    :: Tipo de deal
select    :: Estado bancario
select    :: Etapa
count     :: Número de propietarios
count     :: Número de inquilinos
count     :: Número de avalistas
select    :: Fuente de creación
multilineText :: Observaciones
formula   :: Fecha creación en Airtable
formula   :: Última modificación
select    :: Fuente de creación en gestor (afecta a Drive)
```

### 2. Comisión producto
```
formula   :: Tipo comisión
number    :: Modificada
formula   :: Aplicable
number    :: Firmada
```

### 3. Comisión agencia
```
formula   :: Tipo comisión
number    :: Modificada
formula   :: Aplicable
number    :: Firmada
```

### 4. Condiciones económicas
```
number    :: Alquiler mensual
formula   :: IVA aplica
formula   :: Comisión producto (sin IVA)
formula   :: Comisión producto (con IVA)
formula   :: Comisión agencia (sin IVA)
formula   :: Comisión agencia (con IVA)
formula   :: Importe total (anual)
```

### 5. Agencia vinculada
```
foreignKey:: Agencia
formula   :: (tipoAgencia?)
select    :: (tipoAgencia?)
foreignKey:: Agente
foreignKey:: Comisión
```

### 6. Inmueble
```
foreignKey:: Inmueble
formula   :: (Errores)
formula   :: (Contrato de arrendamiento / estado)
date      :: Fecha firma
```

### 7-9. Propietarios / Inquilinos / Avalistas (tablas de linked records)
```
multilineText x10  :: (columnas de las tablas: index, System/Signaturit, LOPD, MITEK, Experian, Datos…)
```
> Cada tabla muestra columnas de estado: **System (Signaturit)**, **LOPD**, **MITEK**, **Experian**,
> y una columna "Datos" con el nombre/mail del contacto + los "Faltan datos en…".

### 10. Pre-scoring y scoring
```
select    :: Pre-scoring
select    :: Scoring
```
### 11. Scoring Affi → tabla de `estudios` (tickets)

### 12. Fechas de la operación
```
date      :: Fecha cierre
date      :: Fecha inicio
formula   :: Fecha fin        (¡da #ERROR! cuando falta Fecha inicio!)
date      :: fecha firma
foreignKey:: Periodos de fin
```

### 13. Operativa bancaria
```
select    :: Gestor del cobro
select    :: Pagador del servicio
select    :: Método cobro servicio
number    :: Día de cobro
select    :: Quién recibe el pago
number    :: Día de pago
foreignKey:: Pagador del alquiler
foreignKey:: Cobrador del alquiler
foreignKey:: Cuenta de cobro del alquiler
select    :: busquedaBancos
text      :: avisoBusquedaBancos
formula   :: urlConciliacionBancaria   (→ link a base Bancos-ADV)
```

### 14. Documentos de operación
```
select    :: Sistema de docs
formula   :: Errores de creación
select    :: Canal de envío
```
### 15. Contrato de servicio
```
select    :: Estado
formula   :: Última modificación del estado
formula   :: webhookDriveMoveContrato   (→ hook.eu1.make.com/…)
```
### 16. Adenda
```
select    :: Estado
formula   :: Última modificación del estado
```
### 17. SEPA
```
foreignKey:: Pagador
select    :: Estado
formula   :: Última modificación del estado
```
### 18. Póliza
```
text      :: Identificador
select    :: Tipo
date      :: Fecha fin
number    :: Precio póliza (prima)
formula   :: Coste de la póliza
```
### 19. Continuidad de la operación
```
formula   :: Fecha vencimiento
formula   :: Días para vencimiento
select    :: Elegir siguiente deal
foreignKey:: Siguiente
```
### 20. Baja de la operación
```
select    :: Baja póliza
select    :: Estado de carencia
select    :: Stop transferencia propietario
select    :: Stop cobro inquilino
```
### 21. Documentación
```
foreignKey:: Notificar a   (+ adjuntos sin sincronizar con Drive)
```
### 22. Sincronización bancaria
```
select    :: Estado bancos
number    :: Alquiler
richText  :: Cambios precios
text      :: Sync source
+ botón Eliminar
```

## Bindings confirmados (label == field name exacto en schema)

| Label | fieldId | tipo |
|---|---|---|
| fecha firma | `fldGkHSKXD6eLWvfp` | date |
| busquedaBancos | `fldOGuLjLG0RnkcQH` | singleSelect (Pendiente/Encontrado/No encontrado/Error) |
| avisoBusquedaBancos | `fldB31Fu1vuTJX76F` | singleLineText |
| urlConciliacionBancaria | `fldvoVKYS8vPpIjLp` | formula |

> El resto de bindings (≈93 widgets) tienen label custom ≠ field name → **confirmar en el editor
> al construir cada sección**. No asumir nombres.

## Páginas enlazadas (también hay que replicarlas)

Desde el deal se abren paneles de detalle (record review pages propias). Alcance ampliado:

### Contacto — page `pagu1KAtQAVDqRNwi` (tabla `contactos` `tbl7HVrBNBY9cSXzj`)

Se abre al clicar un propietario/inquilino/avalista. ~41 widgets, pestañas:
`Contacto · Datos · LOPD · LOPD · Datos económicos · Datos de pago · Cuentas bancarias · Documentos · KYC · Envío de documentación de deal · Inbox Whatsapp`.

Campos clave: `Tipo` (inquilino/propietario…), `Razón social` (persona/empresa), Nombre, Apellidos,
Email, Teléfono, Tipo documento, Número de documento, Nacionalidad, `Status`, `Canal de envío`,
`Revisión LOPD`, `Situación laboral`, Ingresos, Antigüedad laboral, Número de cuenta, Swift, DNI,
`MITEK`, `EXPERIAN`, `Como inquilino` (link), `Estado Google Drive` (formula).
Documentos: DNI, Documentos de ingresos, Otros (adjuntos).

**Botones de acción del contacto (¡webhooks / integraciones!):**
| Botón | Qué hace (a confirmar con usuario) |
|---|---|
| Solicitar información por Whatsapp | dispara mensaje WhatsApp pidiendo datos/docs |
| Whatsapp | abre chat de WhatsApp |
| Ver en Drive | abre carpeta Drive del contacto |
| Crear en signaturit | crea solicitud de firma en Signaturit |
| Enviar SEPA de nuevo | reenvía mandato SEPA |
| Enviar Adenda de nuevo | reenvía adenda |
| Solicitar datos | pide datos al contacto |
| Eliminar contacto | borra el contacto |

### Inmueble — page `pag7f5sB4i00rSngk` (tabla `inmueble` `tbl7h27kZ2zSPOTca`)

~21 widgets, pestañas: `Inmueble · Propietarios · Inquilinos · Avalistas · Agencia vinculada`.
Campos: `Errores` (formula), `Referencia catastral`, `Dirección`, `Ciudad`, `Código postal`,
`Provincia`, `País`, `Libre de cargas` (checkbox), `Nota simple` (adjuntos), `Propietarios` (link),
`Deal` (link). Sin botones de webhook.

### Otras pendientes de explorar
- `estudios` (Scoring Affi) `tblMkONwIp92BQHJ6` — "Nuevo estudio".
- `agencias` `tblYzrVppN8x3gZnJ` — desde "Agencia vinculada".
- `periodos` `tblcQsflkeCMIGDA9`, `bankAccounts` `tblwUo9JPhPhGrnz5`.

## Tablas relacionadas implicadas

- `deal` `tblwx73iceuKNaz68` (principal, 500 campos)
- `contactos` `tbl7HVrBNBY9cSXzj` (propietarios/inquilinos/avalistas/pagadores)
- `inmueble` `tbl7h27kZ2zSPOTca`
- `agencias` `tblYzrVppN8x3gZnJ`
- `estudios` `tblMkONwIp92BQHJ6` (Scoring Affi)
- `periodos` `tblcQsflkeCMIGDA9`
- `bankAccounts` `tblwUo9JPhPhGrnz5` (cuentas de cobro)
- Base externa **Bancos-ADV** `appuGDs3spnRAvc61` (conciliación)
