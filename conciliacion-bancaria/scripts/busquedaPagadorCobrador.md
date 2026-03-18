# Búsqueda Pagador/Cobrador desde Google Sheets

## Resumen

Automatización de Airtable que, al activarse en la base **Advancing** (`appuV5kGKzKdXlhoR`), busca en Google Sheets los datos bancarios del pagador (inquilino) y cobrador (propietario) de un deal, y los escribe en los campos correspondientes del deal.

Los datos escritos en Advancing se sincronizan automáticamente a la base Bancos, donde desencadenan las automatizaciones existentes (crear balance, etc.).

---

## Trigger

| Campo            | Valor       |
|------------------|-------------|
| **Base**         | Advancing (`appuV5kGKzKdXlhoR`) |
| **Tabla**        | deals       |
| **Condición**    | `busquedaBancos` = "Pendiente" |

### Input Variables

| Variable       | Tipo      | Descripción                          |
|----------------|-----------|--------------------------------------|
| `dealRecordId` | Record ID | ID del registro de deal (del trigger)|

---

## Flujo del Script

```
┌─────────────────────────────────────┐
│  1. Leer deal en Advancing          │
│     → Obtener id_deal               │
├─────────────────────────────────────┤
│  2. Fetch Google Sheets             │
│     → "Transferencia Propietario"   │  → datos cobrador
│     → "CF Cobros"                   │  → datos pagador
├─────────────────────────────────────┤
│  3. Buscar fila por id_deal         │
│     → Extraer IBAN, nombre, doc     │
│     → Normalizar IBAN               │
├─────────────────────────────────────┤
│  4. Actualizar deal en Advancing    │
│     → linkPagador* campos           │
│     → linkCobrador* campos          │
│     → busquedaBancos = resultado    │
│     → avisoBusquedaBancos (audit)   │
├─────────────────────────────────────┤
│  5. Sync automático → Bancos        │
│     → Desencadena crear balance etc │
└─────────────────────────────────────┘
```

---

## Campos del Deal Actualizados

### Pagador (inquilino que paga)
Datos leídos de la hoja **"CF Cobros"**:

| Campo Airtable               | Field ID (Bancos*)     | Dato del Google Sheet |
|-------------------------------|------------------------|-----------------------|
| pagadorNombre                 | `fldjbfiwcIyiDhQf6`   | Nombre                |
| pagadorNombreCompleto         | `fldMh3Lozbh20yv0l`   | Nombre                |
| pagadorIBAN                   | `flda2pglffZTzlTTS`   | IBAN (normalizado)    |
| linkPagadorNumeroDocumento    | `fldDwt4Jb5Szp4D5S`   | DNI/NIE/CIF           |
| linkPagadorNumeroCuenta       | `fldjAksJk2dDWN7Td`   | IBAN (normalizado)    |
| linkPagadorNombreCompleto     | `fldeg2ZjqDixv9G1i`   | Nombre                |

### Cobrador (propietario que recibe)
Datos leídos de la hoja **"Transferencia Propietario"**:

| Campo Airtable                | Field ID (Bancos*)     | Dato del Google Sheet |
|-------------------------------|------------------------|-----------------------|
| linkCobrador                  | `fldXkD5aA9ho0WHqi`   | Nombre                |
| linkCobradorNombreCompleto    | `fld5xxivn9SoV3Mqc`   | Nombre                |
| linkCobradorNumeroDocumento   | `fldlbnM7EAfB51K9e`   | DNI/NIE/CIF           |
| linkCobradorNumeroDeCuenta    | `fldWoxur4wvXNMVl7`   | IBAN (normalizado)    |
| linkCobradorSwiftBIC          | `fld73WKraSn9Qd9gb`   | BIC/SWIFT             |

> *Los Field IDs listados son del schema de Bancos. Verificar los IDs reales en Advancing > Help > API documentation > tabla deals.

---

## Estados de `busquedaBancos`

| Estado           | Significado                                      |
|------------------|--------------------------------------------------|
| **Pendiente**    | Trigger: indica que hay que buscar               |
| **Encontrado**   | Pagador Y cobrador encontrados con IBAN          |
| **Parcial**      | Solo uno de los dos encontrado                   |
| **No encontrado**| Ninguno encontrado (id_deal no existe en sheets) |
| **Error**        | Error de conectividad o id_deal vacío            |

---

## Prerequisitos en Airtable

Crear estos campos manualmente en la tabla **deals** de **Advancing**:

1. **`busquedaBancos`** — Single Select
   - Opciones: `Pendiente` / `Encontrado` / `No encontrado` / `Parcial` / `Error`

2. **`avisoBusquedaBancos`** — Long Text
   - Para el log de auditoría acumulativo

---

## Configuración Google Sheets

### Paso 1: Crear API Key en Google Cloud Console

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear un proyecto nuevo (o usar uno existente)
3. Habilitar la **Google Sheets API**:
   - Menú > APIs & Services > Library
   - Buscar "Google Sheets API" > Enable
4. Crear una API Key:
   - Menú > APIs & Services > Credentials
   - "+ CREATE CREDENTIALS" > "API Key"
   - Copiar la key generada
5. **Restringir la API Key** (recomendado):
   - Click en la key > "Restrict key"
   - En "API restrictions" > seleccionar "Google Sheets API"
   - Guardar

### Paso 2: Configurar el Spreadsheet

1. Abrir el Google Sheet de control ("Hoja control - MES A MES")
2. Click en "Share" > "Anyone with the link" > **Viewer**
3. Copiar el **Spreadsheet ID** de la URL:
   ```
   https://docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit
   ```

### Paso 3: Configurar el Script

En `busquedaPagadorCobrador.js`, rellenar:

```javascript
const SPREADSHEET_ID = 'tu-spreadsheet-id-real';
const GOOGLE_API_KEY = 'tu-api-key-real';
```

### Paso 4: Ajustar índices de columnas

Verificar qué columnas del Google Sheet contienen cada dato y ajustar los índices (0-based: A=0, B=1, C=2...):

```javascript
// Hoja "Transferencia Propietario" (cobrador)
const COL_COBRADOR_ID_DEAL = 0;   // ¿En qué columna está id_deal?
const COL_COBRADOR_NOMBRE = 1;    // ¿Nombre?
const COL_COBRADOR_IBAN = 2;      // ¿IBAN?
const COL_COBRADOR_DOC = 3;       // ¿Documento?
const COL_COBRADOR_BIC = 4;       // ¿BIC?

// Hoja "CF Cobros" (pagador)
const COL_PAGADOR_ID_DEAL = 0;    // ¿id_deal?
const COL_PAGADOR_NOMBRE = 1;     // ¿Nombre?
const COL_PAGADOR_IBAN = 2;       // ¿IBAN?
const COL_PAGADOR_DOC = 3;        // ¿Documento?
```

---

## Configuración de la Automatización en Airtable

1. En la base **Advancing**, ir a **Automations**
2. **New Automation** > nombre: "Búsqueda Pagador/Cobrador"
3. **Trigger**: "When record matches conditions"
   - Table: `deals`
   - Condition: `busquedaBancos` is `Pendiente`
4. **Action**: "Run a script"
   - Pegar el contenido de `busquedaPagadorCobrador.js`
   - En "Input variables": añadir `dealRecordId` = Record ID del trigger

---

## Seguridad

- La API Key solo permite **leer** Google Sheets (no escribir ni borrar)
- La restricción de la API Key limita su uso a la Sheets API
- El spreadsheet está como "viewer only" (nadie puede editarlo via la API Key)
- Para entornos con datos más sensibles, considerar migrar a un proxy (Cloud Function / Make webhook) que use Service Account con credenciales privadas

---

## Auditoría

Cada ejecución añade una línea al campo `avisoBusquedaBancos`:

```
[18/03/2026 14:30] id_deal="DEAL-001" → Encontrado
  Pagador: Juan García López (IBAN: ES1234567890123456789012, Doc: 12345678A)
  Cobrador: María Ruiz Pérez (IBAN: ES9876543210987654321098, Doc: B12345678, BIC: CAIXESBBXXX)
```

El campo es acumulativo — las ejecuciones anteriores se preservan.

---

## Troubleshooting

| Problema | Causa probable | Solución |
|----------|----------------|----------|
| Error 403 de Google Sheets | API Key inválida o Sheets API no habilitada | Verificar key y que la API esté enabled |
| Error 404 de Google Sheets | Spreadsheet ID incorrecto | Verificar el ID en la URL del sheet |
| "No encontrado" cuando debería encontrar | `id_deal` no coincide exactamente | Verificar mayúsculas/espacios en la hoja |
| Campos no se actualizan | Field IDs de Bancos ≠ Advancing | Verificar IDs reales en Advancing API docs |
| "busquedaBancos vacía" | El campo no tiene la opción "Pendiente" | Crear las opciones del single select |
