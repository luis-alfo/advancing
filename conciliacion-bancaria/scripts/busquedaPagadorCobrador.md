# Búsqueda Pagador/Cobrador desde Google Sheets

## Resumen

Automatización en la base **Advancing** (`appuV5kGKzKdXlhoR`) que:

1. Lee el IBAN del pagador y cobrador desde Google Sheets
2. Lo compara contra los IBANs de los contactos vinculados al deal (propietarios, inquilinos, avalistas)
3. Vincula el contacto que matchea como `linkPagador` / `linkCobrador` (record link)
4. Los lookups (nombre, IBAN, documento, BIC) se rellenan **automáticamente** al vincular

Los datos se sincronizan a Bancos, donde desencadenan las automatizaciones existentes.

---

## Trigger

| Campo         | Valor                                       |
|---------------|---------------------------------------------|
| **Base**      | Advancing (`appuV5kGKzKdXlhoR`)            |
| **Tabla**     | deal (`tblwx73iceuKNaz68`)                  |
| **Condición** | `busquedaBancos` (`fldOGuLjLG0RnkcQH`) = "Pendiente" |

### Input Variables

| Variable       | Tipo      | Descripción                          |
|----------------|-----------|--------------------------------------|
| `dealRecordId` | Record ID | ID del registro de deal (del trigger)|

---

## Flujo del Script

```
┌─────────────────────────────────────────────────────┐
│  1. Leer deal → obtener id_deal                     │
├─────────────────────────────────────────────────────┤
│  2. Leer contactos del deal                         │
│     → propietarios (id_propietariolink)             │
│     → inquilinos (inquilino link)                   │
│     → avalistas (id_avalista link)                  │
│     → Para cada uno: nombre, IBAN, documento        │
├─────────────────────────────────────────────────────┤
│  3. Fetch Google Sheets                             │
│     → "Transferencia Propietario" → IBAN cobrador   │
│     → "CF Cobros" → IBAN pagador                    │
├─────────────────────────────────────────────────────┤
│  4. Match contacto (3 niveles de fallback):          │
│     → 1º IBAN exacto (normalizado)                  │
│     → 2º Nombre completo fuzzy (sin acentos/guiones)│
│     → 3º Único contacto con rol esperado            │
├─────────────────────────────────────────────────────┤
│  5. Vincular contacto en linkPagador / linkCobrador │
│     → Record link → lookups automáticos:            │
│        pagadorNombre, pagadorIBAN, pagadorSWIFT,    │
│        linkCobradorNombreCompleto, etc.              │
├─────────────────────────────────────────────────────┤
│  6. Actualizar busquedaBancos + auditoría           │
└─────────────────────────────────────────────────────┘
```

---

## Campos Clave (Advancing)

### Deal (`tblwx73iceuKNaz68`)

| Campo                  | Field ID               | Tipo           | Descripción                        |
|------------------------|------------------------|----------------|------------------------------------|
| id_deal                | `fldnvZWV2jyROqgGl`   | text           | Identificador para buscar en Sheet |
| busquedaBancos         | `fldOGuLjLG0RnkcQH`   | single select  | Estado de la búsqueda              |
| avisoBusquedaBancos    | *CREAR*                | long text      | Log de auditoría                   |
| id_propietariolink     | `fldIFVkAtmKJmo2qo`   | record link    | Propietarios vinculados            |
| inquilino link         | `fldTrPxDj6rtOjONv`   | record link    | Inquilinos vinculados              |
| id_avalista link       | `fldoCJFeFTQ74HX6F`   | record link    | Avalistas vinculados               |
| **linkPagador**        | `fldQFS4EZbVBDsPZW`   | record link    | **← Lo que rellenamos (pagador)**  |
| **linkCobrador**       | `fldGM0dMF3630o2cx`   | record link    | **← Lo que rellenamos (cobrador)** |

### Lookups automáticos (se rellenan solos al vincular)

| Campo                         | Lookup de (contactos) |
|-------------------------------|-----------------------|
| pagadorNombre                 | nombre                |
| pagadorIBAN                   | numero de cuenta      |
| pagadorSWIFT                  | SwiftBIC              |
| linkPagadorNombreCompleto     | nombreYapellidos      |
| linkPagadorNumeroCuenta       | numero de cuenta      |
| linkPagadorNumeroDocumento    | numero documento      |
| linkCobradorNombreCompleto    | nombreYapellidos      |
| linkCobradorNumeroDeCuenta    | numero de cuenta      |
| linkCobradorNumeroDocumento   | numero documento      |
| linkCobradorSwiftBIC          | SwiftBIC              |

### Contactos (`tbl7HVrBNBY9cSXzj`)

| Campo             | Field ID               | Tipo          |
|-------------------|------------------------|---------------|
| nombre            | `fld9pjRDwkZhflVna`   | text          |
| numero de cuenta  | `fldUY0qcYZGBQjuk1`   | text (IBAN)   |
| numero documento  | `fldDicT1bmEt0RWha`   | text          |
| tipo contacto     | `fldDfGSRXsZggcAlq`   | single select |

---

## Estados de `busquedaBancos`

| Estado           | ID Select                | Significado                              |
|------------------|--------------------------|-----------------------------------------|
| **Pendiente**    | `selPkfpiufUzJUGFV`     | Trigger: buscar pagador/cobrador        |
| **Encontrado**   | `selmVUJQJPc8oBsAB`     | Ambos (pagador Y cobrador) vinculados   |
| **No encontrado**| `selw4bYDQoqteZioi`     | Uno o ambos sin match                   |
| **Error**        | `sel7LZyoA43RTEg6t`     | Error de conectividad o datos faltantes |

---

## Prerequisitos en Airtable

Crear manualmente en la tabla **deal** de Advancing:

1. **`avisoBusquedaBancos`** — Long Text — para el log de auditoría acumulativo

> `busquedaBancos` ya existe con las opciones correctas.

---

## Configuración Google Sheets

### Paso 1: Crear API Key en Google Cloud Console

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear proyecto nuevo o usar uno existente
3. **Habilitar Google Sheets API**: Menú > APIs & Services > Library > "Google Sheets API" > Enable
4. **Crear API Key**: APIs & Services > Credentials > "+ CREATE CREDENTIALS" > "API Key"
5. **Restringir la key**: Click en la key > "Restrict key" > API restrictions > Google Sheets API > Guardar

### Paso 2: Configurar el Spreadsheet

1. Abrir el Google Sheet de control
2. Share > "Anyone with the link" > **Viewer**
3. Copiar el Spreadsheet ID de la URL: `https://docs.google.com/spreadsheets/d/ESTE_ID/edit`

### Paso 3: Configurar el Script

```javascript
const SPREADSHEET_ID = 'tu-spreadsheet-id-real';
const GOOGLE_API_KEY = 'tu-api-key-real';
```

### Paso 4: Ajustar índices de columnas

Abrir cada hoja y verificar en qué columna (A=0, B=1...) están `id_deal` e `IBAN`:

```javascript
// "Transferencia Propietario" (cobrador)
const COL_COBRADOR_ID_DEAL = 0;   // ¿Columna del id_deal?
const COL_COBRADOR_IBAN = 2;      // ¿Columna del IBAN?

// "CF Cobros" (pagador)
const COL_PAGADOR_ID_DEAL = 0;
const COL_PAGADOR_IBAN = 2;
```

---

## Configuración de la Automatización

1. En Advancing > **Automations** > New Automation
2. Nombre: "Búsqueda Pagador/Cobrador"
3. **Trigger**: "When record matches conditions"
   - Table: `deal`
   - Condition: `busquedaBancos` is `Pendiente`
4. **Action**: "Run a script"
   - Pegar `busquedaPagadorCobrador.js`
   - Input variables: `dealRecordId` = Record ID del trigger

---

## Auditoría

Cada ejecución añade una línea acumulativa a `avisoBusquedaBancos`:

```
[18/03/2026 14:30] id_deal="DEAL-001" → Encontrado
  Pagador: Juan García (inquilino, IBAN: ES1234567890123456789012)
  Cobrador: María Ruiz (propietario, IBAN: ES9876543210987654321098)
```

---

## Troubleshooting

| Problema | Causa probable | Solución |
|----------|----------------|----------|
| Error 403 Google Sheets | API Key inválida o API no habilitada | Verificar key y que Sheets API esté enabled |
| Error 404 Google Sheets | Spreadsheet ID incorrecto | Verificar ID de la URL |
| "No encontrado" correcto pero inesperado | IBAN del contacto difiere del Sheet | Verificar que el contacto tenga el IBAN correcto en `numero de cuenta` |
| Match no funciona | Formato IBAN distinto (espacios, guiones) | La normalización debería manejar esto; verificar caracteres raros |
| Lookups no se rellenan | linkPagador/linkCobrador correctos | Los lookups se actualizan con un pequeño delay en Airtable |
