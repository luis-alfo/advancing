# Monitor Make.com Scenarios — Guía de configuración

Script de Airtable Automation que monitoriza todos los escenarios de Make.com cada 15 minutos, actualiza una tabla de control en Airtable y envía alertas a Slack cuando detecta problemas.

## Flujo del sistema

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────┐     ┌─────────────┐
│  Airtable Cron  │────▶│  GET scenarios   │────▶│   Script     │────▶│  Update     │
│  cada 15 min    │     │  Make.com API    │     │  procesa     │     │  Airtable   │
└─────────────────┘     └──────────────────┘     │  status      │     └─────────────┘
                                                  │              │
                                                  │              │     ┌─────────────┐
                                                  │              │────▶│  Alert      │
                                                  │              │     │  Slack      │
                                                  └──────────────┘     └─────────────┘
```

## Prerequisitos

1. **Make.com**: Token API con permisos de lectura de escenarios
2. **Airtable**: Plan Pro o superior (para automaciones cada 15 min)
3. **Slack**: Incoming Webhook configurado en el canal deseado

---

## 1. Crear token API en Make.com

1. Ir a **Make.com → Perfil → API** (o Settings → API Tokens)
2. Click en **Create a new token**
3. Nombre: `Airtable Monitor`
4. Scopes necesarios:
   - `scenarios:read` — leer escenarios
   - `logs:read` — leer logs de ejecución
   - `dlq:read` — leer cola de ejecuciones incompletas (opcional)
5. Copiar el token generado

### Obtener Team ID

El Team ID se encuentra en la URL de Make.com cuando estás en tu organización:
```
https://eu2.make.com/XXXXX/scenarios  ←── XXXXX es tu Team ID
```

### Determinar la región (Base URL)

Tu Base URL depende de la región de tu cuenta:
- Europa: `https://eu1.make.com` o `https://eu2.make.com`
- EEUU: `https://us1.make.com` o `https://us2.make.com`

Mira la URL de tu navegador cuando accedes a Make.com para saber cuál es.

---

## 2. Crear Incoming Webhook en Slack

1. Ir a [api.slack.com/apps](https://api.slack.com/apps)
2. **Create New App → From scratch**
3. Nombre: `Make Monitor` / Workspace: tu workspace
4. En el menú lateral: **Incoming Webhooks → Activate**
5. Click en **Add New Webhook to Workspace**
6. Seleccionar el canal donde quieres recibir alertas (ej: `#ops-alertas`)
7. Copiar la URL del webhook (formato: `https://hooks.slack.com/services/T.../B.../xxx`)

---

## 3. Crear tabla de monitorización en Airtable

Crear una nueva tabla en tu base de Airtable con el nombre **`Make Monitoring`** (o el que prefieras) con los siguientes campos:

| Campo            | Tipo               | Descripción                                    |
|------------------|--------------------|-------------------------------------------------|
| `scenarioId`     | Number (integer)   | ID del escenario en Make.com                    |
| `name`           | Single line text   | Nombre del escenario                            |
| `status`         | Single select      | Estado actual del escenario                     |
| `isActive`       | Checkbox           | Si el scheduling está activado                  |
| `lastExecDate`   | Date time          | Fecha/hora de la última ejecución               |
| `lastExecStatus` | Single line text   | Resultado de la última ejecución                |
| `nextExecDate`   | Date time          | Fecha/hora de la próxima ejecución programada   |
| `makeUrl`        | URL                | Link directo al escenario en Make.com           |
| `lastChecked`    | Date time          | Cuándo se realizó la última comprobación        |
| `errorMessage`   | Long text          | Mensaje de error (si aplica)                    |
| `dlqCount`       | Number (integer)   | Ejecuciones incompletas en cola                 |

### Opciones del campo `status` (Single Select)

Crear estas opciones con los colores sugeridos:

| Opción    | Color sugerido |
|-----------|---------------|
| `OK`      | Verde         |
| `Error`   | Rojo          |
| `Warning` | Amarillo      |
| `Paused`  | Naranja       |
| `Stopped` | Gris          |

### Obtener los Field IDs

Después de crear la tabla, necesitas los Field IDs reales para configurar el script:

1. Ir a [airtable.com/developers/web/api/introduction](https://airtable.com/developers/web/api/introduction)
2. Seleccionar tu base
3. Buscar la tabla "Make Monitoring"
4. Anotar los Field IDs de cada campo (formato: `fldXXXXXXXXXXXX`)

Luego actualiza la sección `FIELDS` del script con los IDs reales:

```javascript
const FIELDS = {
    scenarioId:     'fldXXXXXXXXXXXX',  // tu field ID real
    name:           'fldXXXXXXXXXXXX',
    status:         'fldXXXXXXXXXXXX',
    isActive:       'fldXXXXXXXXXXXX',
    lastExecDate:   'fldXXXXXXXXXXXX',
    lastExecStatus: 'fldXXXXXXXXXXXX',
    nextExecDate:   'fldXXXXXXXXXXXX',
    makeUrl:        'fldXXXXXXXXXXXX',
    lastChecked:    'fldXXXXXXXXXXXX',
    errorMessage:   'fldXXXXXXXXXXXX',
    dlqCount:       'fldXXXXXXXXXXXX',
};
```

### Obtener el Table ID

El Table ID lo necesitas para la variable `monitorTableId`. Lo encuentras en la URL de Airtable:
```
https://airtable.com/appXXXXX/tblYYYYY/...  ←── tblYYYYY es tu Table ID
```

---

## 4. Crear la automatización en Airtable

1. Ir a **Airtable → Automations** (pestaña superior)
2. Click en **Create automation**
3. Nombre: `Monitor Make.com Scenarios`

### Configurar Trigger

1. Trigger type: **"When record matches conditions"** — NO. Usar: **"At a scheduled time"**
2. Intervalo: **Every 15 minutes**

### Configurar Action

1. Action type: **"Run a script"**
2. Pegar el contenido completo de `monitorMakeScenarios.js`
3. Configurar **Input variables** (botón "Add input variable"):

| Variable name   | Valor                                              |
|-----------------|-----------------------------------------------------|
| `makeApiToken`  | Tu token API de Make.com                            |
| `makeBaseUrl`   | URL base (ej: `https://eu2.make.com`)               |
| `makeTeamId`    | Tu Team ID de Make.com                              |
| `slackWebhookUrl` | URL del Incoming Webhook de Slack                |
| `monitorTableId`  | Table ID de la tabla de monitorización (ej: `tblXXX`) |

4. **IMPORTANTE**: Antes de pegar el script, actualiza los Field IDs en la sección `FIELDS` con los IDs reales de tu tabla.

### Activar

1. Click en **Test** para ejecutar manualmente una vez
2. Verificar que:
   - Se crean registros en la tabla de monitorización
   - Los estados son correctos
   - Si hay problemas, se recibe alerta en Slack
3. **Activar** la automatización

---

## 5. Qué detecta el monitor

| Problema | Descripción | Alerta |
|----------|-------------|--------|
| 🔴 **Error** | Última ejecución del escenario falló | Slack + status `Error` |
| ⏸️ **Paused** | Escenario activo pero pausado (ej: por errores consecutivos) | Slack + status `Paused` |
| ⛔ **Stopped** | Escenario desactivado (scheduling off) | Slack + status `Stopped` |
| 📬 **DLQ** | Ejecuciones incompletas pendientes en cola | Slack + campo `dlqCount` |
| 🗑️ **Deleted** | Escenario existía en Airtable pero ya no en Make.com | Slack + status `Stopped` |

---

## 6. Personalización

### Ignorar escenarios específicos

Si quieres que ciertos escenarios no generen alertas (ej: escenarios de test que están normalmente pausados), puedes agregar un campo `ignoreAlerts` (Checkbox) a la tabla y modificar el script en la sección de detección de problemas:

```javascript
// Tras la línea: const existingRecordId = existingMap.get(scenario.id);
// Agregar check de ignore
```

### Cambiar el formato de alerta Slack

El script usa [Block Kit](https://api.slack.com/block-kit) de Slack para formatear las alertas. Puedes personalizar los bloques en la sección `STEP 8` del script.

### Alerta de "todo OK"

Por defecto el script solo alerta cuando hay problemas. Si quieres un reporte periódico de "todo OK", añade un bloque al final del script que envíe un mensaje a Slack cuando `problems.length === 0`.

---

## Troubleshooting

### Error 401 en Make.com API
- Token API expirado o incorrecto
- Verificar que el token tiene los scopes necesarios

### Error 403 en Make.com API
- El Team ID no corresponde al token
- El token no tiene permisos de lectura en ese equipo

### Script timeout (>30 segundos)
- Si tienes muchos escenarios (>100), el script puede tardar más de 30 segundos
- Solución: Reducir el batch de logs en paralelo (cambiar `i += 5` a `i += 3` en STEP 3)
- O filtrar solo escenarios de ciertos folders

### No se crean opciones de Single Select
- Airtable crea automáticamente las opciones de Single Select la primera vez que se escriben
- Asegúrate de que el campo `status` está configurado como "Single select", no como "Single line text"

### Los Field IDs no funcionan
- Verificar que usaste los Field IDs (formato `fldXXXXXXXXXXXX`), NO los nombres de campo
- Los Field IDs se obtienen de la documentación de la API de Airtable para tu base
