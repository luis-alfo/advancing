---
title: Airtable Single Record Fetch Returns 422 When Using fields[] Query Parameters
category: integration-issues
tags: [airtable-api, query-parameters, rest-api, single-record-fetch]
component: src/services/airtable.js
severity: medium
date_solved: 2026-02-12
symptoms:
  - API returns 422 "Invalid request: parameter validation failed" error
  - App displays "No se encontró la operación de pago solicitada" error message
  - Single record fetch by recordID fails to retrieve transaction data
root_cause: Airtable REST API single-record GET endpoint (/v0/{baseId}/{tableName}/{recordId}) does not accept fields[] query parameters, unlike the list endpoint which does support field filtering
---

# Airtable Single Record Fetch Returns 422 When Using fields[] Query Parameters

## Problem

When fetching a single record from the Airtable REST API by record ID (`GET /v0/{baseId}/{tableName}/{recordId}`), appending `fields[]` query parameters causes an HTTP 422 error:

```
{"error":{"type":"INVALID_REQUEST_UNKNOWN","message":"Invalid request: parameter validation failed. Check your request data."}}
```

The app's error handling caught this as a generic failure, displaying "No se encontró la operación de pago solicitada" to the user — making it look like the record didn't exist when it actually did.

## Investigation

**Attempt 1 — With fields[] (Failed, 422)**:
```js
const fields = PAYMENT_FIELDS.map(f => `fields%5B%5D=${f}`).join('&')
const url = `${AIRTABLE_BASE_URL}/${baseId}/transactionsUnnax/${recordID}?${fields}`
// → HTTP 422 Unprocessable Entity
```

**Attempt 2 — Without fields[] (Success, 200)**:
```js
const url = `${AIRTABLE_BASE_URL}/${baseId}/transactionsUnnax/${recordID}`
// → HTTP 200 OK — returns complete record with all fields
```

Verified via curl that the same record returned 200 without params and 422 with `fields[]`.

## Root Cause

The Airtable REST API has **asymmetric parameter support** between endpoints:

| Endpoint | `fields[]` supported? |
|---|---|
| List records: `GET /v0/{baseId}/{tableName}` | Yes |
| Single record: `GET /v0/{baseId}/{tableName}/{recordId}` | **No** (returns 422) |

The single-record endpoint always returns all fields. Field selection must happen in the application layer.

## Solution

Remove `fields[]` query parameters from single-record fetch. Pick needed fields from the response object instead.

**Before (broken)**:
```js
import { AIRTABLE_BASE_URL, AIRTABLE_TABLE_NAME, PAYMENT_FIELDS } from '../config/constants'

const fields = PAYMENT_FIELDS.map(f => `fields%5B%5D=${f}`).join('&')
const url = `${AIRTABLE_BASE_URL}/${baseId}/${AIRTABLE_TABLE_NAME}/${recordID}?${fields}`
```

**After (working)**:
```js
import { AIRTABLE_BASE_URL, AIRTABLE_TABLE_NAME } from '../config/constants'

const url = `${AIRTABLE_BASE_URL}/${baseId}/${AIRTABLE_TABLE_NAME}/${recordID}`
```

Application-layer field selection remains unchanged:
```js
return {
  concept: data.fields.concept || 'Sin concepto',
  amount: data.fields.moneyAmount ? data.fields.moneyAmount / 100 : 0,
  currency: data.fields.moneyCurrency || 'EUR',
  property: data.fields.inmueble || 'No especificado',
  // ...etc
}
```

## Prevention

- **Know your endpoint**: Airtable list vs single-record endpoints accept different params. Always test with curl before coding.
- **Separate error codes**: Handle 422 (bad request) differently from 404 (not found). A 422 means your request is wrong, not the record.
- **Improve error handling**:
  ```js
  if (response.status === 404) {
    throw new Error('No se encontró la operación de pago solicitada.')
  }
  if (response.status === 422) {
    throw new Error('Error en la petición a Airtable. Revisa los parámetros.')
  }
  ```

## Related

- `src/services/airtable.js` — Airtable fetch service
- `src/config/constants.js` — API URL and table name constants
- `airtable_schema_bancos.md` — Full Airtable base schema (335KB)
- [Airtable API: Retrieve a record](https://airtable.com/developers/web/api/get-record)
