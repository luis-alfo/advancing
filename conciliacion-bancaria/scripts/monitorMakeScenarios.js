// ============================================================================
// AIRTABLE AUTOMATION SCRIPT: Monitor Make.com Scenarios
// ============================================================================
//
// TRIGGER: Automatización programada cada 15 minutos
//
// INPUT VARIABLES (configurar en la automatización):
//   - makeApiToken:    Token API de Make.com (Settings → API → Create token)
//   - makeBaseUrl:     URL base de la API de Make.com (ej: https://eu2.make.com)
//   - makeTeamId:      Team/Organization ID de Make.com
//   - slackWebhookUrl: URL del Incoming Webhook de Slack
//   - monitorTableId:  ID de la tabla de monitorización en Airtable (ej: tblXXXXXXXX)
//
// FUNCIONAMIENTO:
//   1. Obtiene todos los escenarios del equipo en Make.com via API
//   2. Sincroniza la tabla de monitorización en Airtable (crea/actualiza registros)
//   3. Para escenarios activos, consulta el último log de ejecución
//   4. Detecta problemas: escenarios caídos, pausados, con errores o DLQ pendientes
//   5. Envía alerta a Slack si hay problemas
//
// TABLA AIRTABLE REQUERIDA — ver monitorMakeScenarios.md para el schema completo
// ============================================================================

const config = input.config();

const MAKE_API_TOKEN = config.makeApiToken;
const MAKE_BASE_URL = config.makeBaseUrl;     // ej: https://eu2.make.com
const MAKE_TEAM_ID = config.makeTeamId;
const SLACK_WEBHOOK_URL = config.slackWebhookUrl;
const MONITOR_TABLE_ID = config.monitorTableId;

// --- Referencia a la tabla de monitorización ---
const monitorTable = base.getTable(MONITOR_TABLE_ID);

// --- Field IDs (configurar tras crear la tabla — ver monitorMakeScenarios.md) ---
// Estos IDs deben coincidir con los campos de tu tabla de monitorización.
// Usa "Airtable → Help → API documentation" para ver los field IDs reales.
const FIELDS = {
    scenarioId:     'fld_scenarioId',      // Number
    name:           'fld_name',            // Single line text
    status:         'fld_status',          // Single select: OK | Error | Warning | Paused | Stopped
    isActive:       'fld_isActive',        // Checkbox
    lastExecDate:   'fld_lastExecDate',    // Date time
    lastExecStatus: 'fld_lastExecStatus',  // Single line text
    nextExecDate:   'fld_nextExecDate',    // Date time
    makeUrl:        'fld_makeUrl',         // URL
    lastChecked:    'fld_lastChecked',     // Date time
    errorMessage:   'fld_errorMessage',    // Long text
    dlqCount:       'fld_dlqCount',        // Number
};

// ============================================================================
// UTILIDADES
// ============================================================================

async function makeApiGet(path) {
    const url = `${MAKE_BASE_URL}/api/v2${path}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Token ${MAKE_API_TOKEN}`,
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Make API error ${response.status} en ${path}: ${text}`);
    }
    return response.json();
}

function scenarioUrl(scenarioId) {
    // Construir URL directa al escenario en Make.com
    return `${MAKE_BASE_URL}/scenarios/${scenarioId}`;
}

function determineStatus(scenario, lastLog) {
    if (!scenario.isActive) return 'Stopped';
    if (scenario.isPaused) return 'Paused';
    if (lastLog && lastLog.type === 'error') return 'Error';
    if (lastLog && lastLog.type === 'warning') return 'Warning';
    return 'OK';
}

// ============================================================================
// STEP 1: Obtener todos los escenarios de Make.com
// ============================================================================

console.log('=== Monitor Make.com Scenarios ===');
console.log(`Equipo: ${MAKE_TEAM_ID}`);
console.log(`API: ${MAKE_BASE_URL}`);

let allScenarios = [];
let offset = 0;
const PAGE_SIZE = 150;

// Paginación — Make.com limita a ~150 resultados por página
while (true) {
    const data = await makeApiGet(
        `/scenarios?teamId=${MAKE_TEAM_ID}&pg[limit]=${PAGE_SIZE}&pg[offset]=${offset}`
    );
    const scenarios = data.scenarios || [];
    allScenarios = allScenarios.concat(scenarios);
    console.log(`Obtenidos ${scenarios.length} escenarios (offset ${offset})`);

    if (scenarios.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
}

console.log(`Total escenarios en Make.com: ${allScenarios.length}`);

// ============================================================================
// STEP 2: Obtener registros existentes en Airtable para hacer upsert
// ============================================================================

const existingQuery = await monitorTable.selectRecordsAsync({
    fields: [FIELDS.scenarioId],
});

// Mapa: scenarioId → recordId (para saber si crear o actualizar)
const existingMap = new Map();
for (const record of existingQuery.records) {
    const sid = record.getCellValue(FIELDS.scenarioId);
    if (sid != null) {
        existingMap.set(sid, record.id);
    }
}

console.log(`Registros existentes en Airtable: ${existingMap.size}`);

// ============================================================================
// STEP 3: Para escenarios activos, obtener último log de ejecución
// ============================================================================

const activeScenarios = allScenarios.filter(s => s.isActive && !s.isPaused);
console.log(`Escenarios activos: ${activeScenarios.length}`);

// Obtener logs en paralelo (batches de 5 para no saturar la API)
const logMap = new Map(); // scenarioId → last log entry

for (let i = 0; i < activeScenarios.length; i += 5) {
    const batch = activeScenarios.slice(i, i + 5);
    const logPromises = batch.map(async (scenario) => {
        try {
            const data = await makeApiGet(
                `/scenarios/${scenario.id}/logs?pg[limit]=1&pg[sortDir]=desc`
            );
            const logs = data.scenarioLogs || data.logs || [];
            if (logs.length > 0) {
                logMap.set(scenario.id, logs[0]);
            }
        } catch (err) {
            console.log(`  ⚠ No se pudo obtener log del escenario ${scenario.id}: ${err.message}`);
        }
    });
    await Promise.all(logPromises);
}

console.log(`Logs obtenidos: ${logMap.size}`);

// ============================================================================
// STEP 4: Obtener DLQ (ejecuciones incompletas) para escenarios activos
// ============================================================================

const dlqMap = new Map(); // scenarioId → count

for (let i = 0; i < activeScenarios.length; i += 5) {
    const batch = activeScenarios.slice(i, i + 5);
    const dlqPromises = batch.map(async (scenario) => {
        try {
            const data = await makeApiGet(
                `/dlqs?scenarioId=${scenario.id}&resolved=false&pg[limit]=0`
            );
            // pg[limit]=0 nos da solo el count sin los datos
            const count = data.dlqItemsCount || data.pg?.recordCount || 0;
            if (count > 0) {
                dlqMap.set(scenario.id, count);
            }
        } catch (err) {
            // DLQ endpoint puede no estar disponible en todos los planes
        }
    });
    await Promise.all(dlqPromises);
}

// ============================================================================
// STEP 5: Preparar actualizaciones para Airtable
// ============================================================================

const now = new Date().toISOString();
const toCreate = [];
const toUpdate = [];
const problems = []; // Para alertas Slack

for (const scenario of allScenarios) {
    const lastLog = logMap.get(scenario.id);
    const dlqCount = dlqMap.get(scenario.id) || 0;
    const status = determineStatus(scenario, lastLog);

    const fields = {
        [FIELDS.scenarioId]:     scenario.id,
        [FIELDS.name]:           scenario.name || `Scenario #${scenario.id}`,
        [FIELDS.status]:         { name: status },
        [FIELDS.isActive]:       scenario.isActive || false,
        [FIELDS.lastExecDate]:   scenario.lastExec || null,
        [FIELDS.lastExecStatus]: lastLog ? (lastLog.type || lastLog.status || 'unknown') : '',
        [FIELDS.nextExecDate]:   scenario.nextExec || null,
        [FIELDS.makeUrl]:        scenarioUrl(scenario.id),
        [FIELDS.lastChecked]:    now,
        [FIELDS.errorMessage]:   lastLog && lastLog.type === 'error'
                                     ? (lastLog.message || lastLog.detail || 'Error sin mensaje')
                                     : '',
        [FIELDS.dlqCount]:       dlqCount,
    };

    const existingRecordId = existingMap.get(scenario.id);
    if (existingRecordId) {
        toUpdate.push({ id: existingRecordId, fields });
    } else {
        toCreate.push({ fields });
    }

    // Detectar problemas para Slack
    if (status === 'Error') {
        problems.push({
            name: scenario.name,
            id: scenario.id,
            type: 'error',
            message: fields[FIELDS.errorMessage],
            url: scenarioUrl(scenario.id),
        });
    } else if (status === 'Paused') {
        problems.push({
            name: scenario.name,
            id: scenario.id,
            type: 'paused',
            message: 'Escenario pausado inesperadamente',
            url: scenarioUrl(scenario.id),
        });
    } else if (status === 'Stopped') {
        problems.push({
            name: scenario.name,
            id: scenario.id,
            type: 'stopped',
            message: 'Escenario desactivado',
            url: scenarioUrl(scenario.id),
        });
    }

    if (dlqCount > 0) {
        problems.push({
            name: scenario.name,
            id: scenario.id,
            type: 'dlq',
            message: `${dlqCount} ejecuciones incompletas en cola`,
            url: scenarioUrl(scenario.id),
        });
    }
}

// ============================================================================
// STEP 6: Escribir en Airtable (batches de 50)
// ============================================================================

let created = 0;
let updated = 0;

// Crear nuevos registros
for (let i = 0; i < toCreate.length; i += 50) {
    const batch = toCreate.slice(i, i + 50);
    await monitorTable.createRecordsAsync(batch);
    created += batch.length;
}

// Actualizar existentes
for (let i = 0; i < toUpdate.length; i += 50) {
    const batch = toUpdate.slice(i, i + 50);
    await monitorTable.updateRecordsAsync(batch);
    updated += batch.length;
}

console.log(`Registros creados: ${created}`);
console.log(`Registros actualizados: ${updated}`);

// ============================================================================
// STEP 7: Detectar escenarios eliminados en Make.com
// ============================================================================

const currentScenarioIds = new Set(allScenarios.map(s => s.id));
const deletedRecords = [];

for (const record of existingQuery.records) {
    const sid = record.getCellValue(FIELDS.scenarioId);
    if (sid != null && !currentScenarioIds.has(sid)) {
        deletedRecords.push(record.id);
        problems.push({
            name: `Scenario #${sid}`,
            id: sid,
            type: 'deleted',
            message: 'Escenario ya no existe en Make.com',
            url: '',
        });
    }
}

// Marcar como eliminados (actualizar status)
if (deletedRecords.length > 0) {
    const deleteUpdates = deletedRecords.map(id => ({
        id,
        fields: {
            [FIELDS.status]: { name: 'Stopped' },
            [FIELDS.isActive]: false,
            [FIELDS.lastChecked]: now,
            [FIELDS.errorMessage]: 'Escenario eliminado de Make.com',
        },
    }));
    for (let i = 0; i < deleteUpdates.length; i += 50) {
        const batch = deleteUpdates.slice(i, i + 50);
        await monitorTable.updateRecordsAsync(batch);
    }
    console.log(`Escenarios marcados como eliminados: ${deletedRecords.length}`);
}

// ============================================================================
// STEP 8: Alerta Slack
// ============================================================================

if (problems.length > 0 && SLACK_WEBHOOK_URL) {
    console.log(`Problemas detectados: ${problems.length}. Enviando alerta a Slack...`);

    const blocks = [
        {
            type: 'header',
            text: {
                type: 'plain_text',
                text: `🚨 Make.com Monitor — ${problems.length} problema(s) detectado(s)`,
            },
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `*Equipo:* ${MAKE_TEAM_ID} | *Hora:* ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}`,
            },
        },
        { type: 'divider' },
    ];

    const typeEmoji = {
        error:   '🔴',
        paused:  '⏸️',
        stopped: '⛔',
        dlq:     '📬',
        deleted: '🗑️',
    };

    for (const p of problems) {
        const emoji = typeEmoji[p.type] || '⚠️';
        const linkText = p.url ? `<${p.url}|Ver en Make>` : '';
        blocks.push({
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `${emoji} *${p.name}* (ID: ${p.id})\n${p.message}\n${linkText}`,
            },
        });
    }

    blocks.push(
        { type: 'divider' },
        {
            type: 'context',
            elements: [{
                type: 'mrkdwn',
                text: `Total escenarios: ${allScenarios.length} | Activos: ${activeScenarios.length} | Problemas: ${problems.length}`,
            }],
        }
    );

    const slackPayload = { blocks };

    try {
        const slackResponse = await fetch(SLACK_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(slackPayload),
        });

        if (slackResponse.ok) {
            console.log('Alerta Slack enviada correctamente.');
        } else {
            console.error(`Error al enviar alerta Slack: ${slackResponse.status}`);
        }
    } catch (err) {
        console.error(`Error al enviar alerta Slack: ${err.message}`);
    }
} else if (problems.length === 0) {
    console.log('Sin problemas detectados. No se envía alerta.');
} else {
    console.log('Problemas detectados pero no hay Slack Webhook configurado.');
}

// ============================================================================
// RESUMEN
// ============================================================================

console.log('========================================');
console.log('MONITORIZACIÓN COMPLETADA');
console.log(`Escenarios totales:    ${allScenarios.length}`);
console.log(`Escenarios activos:    ${activeScenarios.length}`);
console.log(`Registros creados:     ${created}`);
console.log(`Registros actualizados: ${updated}`);
console.log(`Problemas detectados:  ${problems.length}`);
if (problems.length > 0) {
    for (const p of problems) {
        console.log(`  - [${p.type.toUpperCase()}] ${p.name}: ${p.message}`);
    }
}
console.log('========================================');
