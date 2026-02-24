# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pasarela de pago con tarjeta para Advancing (empresa de gestion de alquiler y seguros de impago). Reemplaza la antigua pasarela en FlutterFlow. Recibe un `recordID` por URL, consulta Airtable para obtener datos de la transaccion (concepto, importe, inmueble, num operacion) y muestra una interfaz de pago elegante.

La integracion con el widget de Unnax (via Make/Integromat webhook) esta pendiente como placeholder.

## Commands

```bash
npm run dev      # Servidor de desarrollo en http://localhost:5173
npm run build    # Build de produccion en dist/
npm run preview  # Preview del build de produccion
```

## Architecture

- **Stack**: React 18 + Vite + Tailwind CSS v4 + React Router v6
- **No backend**: El cliente consulta directamente la API de Airtable
- **Single page**: Ruta unica `/pasarela?recordID=xxx`

### Data Flow

```
URL (?recordID=xxx) → src/services/airtable.js → Airtable API → transactionsUnnax table → React state → UI
```

### Airtable Integration

- **Base**: Conciliacion bancaria (configurar `VITE_AIRTABLE_BASE_ID` en `.env`)
- **Table**: `transactionsUnnax` (ID: `tblhE3J0X3Zg2CB1o`)
- **Key fields**:
  - `concept` - Concepto del pago (texto)
  - `moneyAmount` - Importe en centimos (formula, se divide entre 100 para mostrar)
  - `moneyCurrency` - Moneda en ISO 4217 (default EUR)
  - `inmueble` - Direccion del inmueble (texto)
  - `index` - Identificador de la transaccion / num. operacion (formula)
  - `paymentMethod` - creditCard | accountToAccount (select)
  - `status` - Estado Unnax de la transaccion (select)
  - `clientWidgetURL` - URL del widget Unnax si ya existe (url)
  - `enableCreditCard` - "true"/"false" (formula)

### Design System

- **Color dominante**: Azul Royal `#002366` (Tailwind: `royal`)
- **Color acento**: Verde Advancing `#6CF0B9` (Tailwind: `advancing-green`) - solo CTAs
- **Fondo**: `#F5F5F5` (Tailwind: `gray-warm`)
- **Tipografia**: Inter (Google Fonts)
- Tailwind v4 con configuracion CSS-first en `src/index.css` via `@theme`

### Pending Integration

El boton "Pagar con tarjeta" actualmente muestra un placeholder. La integracion con Make debe:
1. POST al webhook de Make con el recordID
2. Make genera el widget de Unnax y devuelve `clientWidgetURL`
3. La pasarela carga el widget en un iframe dentro de `WidgetPlaceholder.jsx`

### Airtable Schemas

- `airtable_schema_bancos.md` - Schema de la base "Conciliacion bancaria"
- `airtable_schema_operaciones.md` - Schema de la base "Gestor de Operaciones" (`appuV5kGKzKdXlhoR`, 26 tablas)
