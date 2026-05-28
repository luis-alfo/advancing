// Bindings campo->nombre real de la tabla `deal` (tblwx73iceuKNaz68).
//
// ⚠️ Las ETIQUETAS de la interfaz original NO son los nombres de campo (solo 4/48 coincidían).
// Estos nombres están VERIFICADOS cruzando el record de muestra recdEihfmaTqj2clC (vía API)
// contra los valores vistos en pantalla. Al añadir campos nuevos, verificar igual:
//   node/python: cargar docs/sample_deal_record.json y casar valor visible -> field name.

export const DEAL_TABLE_ID = 'tblwx73iceuKNaz68';
export const CONTACTOS_TABLE_ID = 'tbl7HVrBNBY9cSXzj';
export const INMUEBLE_TABLE_ID = 'tbl7h27kZ2zSPOTca';
export const ESTUDIOS_TABLE_ID = 'tblMkONwIp92BQHJ6';

// Campos del contacto usados en las tablas de personas (verificados contra el schema).
export const CONTACTO_FIELDS = {
  nombre: 'nombreYapellidos', // formula
  tipo: 'tipo contacto', // propietario/inquilino/avalista/agente
  email: 'email',
  system: 'lopdSystem', // "Signaturit"/"Pandadoc" (System)
  lopd: 'LOPD STATUS select',
  mitek: 'kycMitekSelect',
  experian: 'kycExperianSelect',
  estudio: 'estudiosAffi', // link al estudio (para agrupar inquilinos/avalistas)
  avalistas: 'linkInquilinoAAvalista', // (en un inquilino) sus avalistas vinculados
};
export const CONTACTO_SUBSCRIBED = Object.values(CONTACTO_FIELDS);

// Campos de VALIDACIÓN (formulas que listan "Faltan datos en…"). Vacío string ⇒ sin errores.
export const VALIDATION_FIELDS = {
  deal: 'checkDatosDeal',          // "Faltan datos en deal: …"
  propietario: 'CheckDatosPropietario',
  inquilino: 'CheckDatosInquilino',
  inmueble: 'CheckDatosInmueble',
  consolidado: 'CheckDatosArray',  // todos los anteriores concatenados (≈ widget "Errores de creación")
};

// Datos básicos / identificación (etiqueta original → field name real).
export const BASIC_FIELDS = {
  titulo: 'indexDeal',             // formula, campo primario
  hubspotId: 'id_deal',            // "Hubspot Deal ID"
  owner: 'nombre empleado',        // "Owner" (lookup)
  producto: 'producto',            // "Producto"
  tipoContrato: 'tipo contrato',   // "Tipo contrato"
  tipoDeal: 'canal de entrada',    // "Tipo de deal"  (¡label ≠ field!)
  etapa: 'statusAplicable',        // "Etapa"  (a desambiguar vs "B2C STATUS")
  fuenteCreacion: 'fuenteCreacionEnGestor',
  alquilerMensual: 'alquiler mensual',
  gestionCobro: 'gestionCobroSelect',   // "Gestor del cobro"
  pagadorServicio: 'pagadorServicio',
  sistemaDocs: 'signingSystem',    // "Sistema de docs"
};

// Lista mínima de fields a suscribir con useRecords (evita re-renders por los 500 campos).
export const SUBSCRIBED_FIELDS = [
  ...Object.values(VALIDATION_FIELDS),
  ...Object.values(BASIC_FIELDS),
];

// Config declarativa de secciones del deal (read-only de momento).
// Cada campo: {label, field (nombre real o null si pendiente de verificar), format}.
// format: 'text' | 'badge' | 'currency' | 'percent' | 'date' | 'number'.
// Añadir un campo = añadir una línea aquí (y, si quieres suscribirlo, a SUBSCRIBED_FIELDS).
export const SECTIONS = [
  {
    id: 'datos-basicos',
    title: 'Datos básicos',
    validationField: 'checkDatosDeal', // "Faltan datos en deal: …"
    summary: ['Producto', 'Tipo contrato', 'Owner'],
    fields: [
      {label: 'Hubspot Deal ID', field: 'id_deal', format: 'text'},
      {label: 'Owner', field: 'nombre empleado', format: 'text'},
      {label: 'Producto', field: 'producto', format: 'badge'},
      {label: 'Tipo contrato', field: 'tipo contrato', format: 'badge'},
      {label: 'Tipo de deal', field: 'canal de entrada', format: 'badge'},
      {label: 'Etapa', field: 'statusAplicable', format: 'badge'},
      {label: 'Fuente de creación', field: 'fuenteCreacionEnGestor', format: 'badge'},
    ],
  },
  {
    id: 'comision-producto',
    title: 'Comisión producto',
    summary: ['Tipo comisión', 'Aplicable'],
    fields: [
      {label: 'Tipo comisión', field: 'comision producto aplicable (txt)', format: 'text'},
      {label: 'Aplicable', field: 'comision producto aplicable', format: 'percent'},
    ],
  },
  {
    id: 'comision-agencia',
    title: 'Comisión agencia',
    summary: ['Tipo comisión', 'Aplicable'],
    fields: [
      {label: 'Tipo comisión', field: 'comision agencia aplicable (txt)', format: 'text'},
      {label: 'Aplicable', field: 'comision agencia aplicable', format: 'percent'}, // verificar binding
    ],
  },
  {
    id: 'condiciones-economicas',
    title: 'Condiciones económicas',
    summary: ['Alquiler mensual', 'Importe total (anual)'],
    fields: [
      {label: 'Alquiler mensual', field: 'alquiler mensual', format: 'currency'},
      {label: 'IVA aplica', field: 'IVAAplicaText', format: 'text'},
      {label: 'Comisión producto (sin IVA)', field: 'comision producto calculo', format: 'currency'},
      {label: 'Comisión producto (con IVA)', field: 'ComisionProductoConIVA', format: 'currency'},
      {label: 'Comisión agencia (sin IVA)', field: 'comision agencia calculo', format: 'currency'},
      {label: 'Comisión agencia (con IVA)', field: 'ComisionAgenciaConIVA', format: 'currency'},
      {label: 'Importe total (anual)', field: 'Importe anual', format: 'currency'},
    ],
  },
  {
    id: 'operativa-bancaria',
    title: 'Operativa bancaria',
    summary: ['Gestor del cobro', 'Día de cobro'],
    fields: [
      {label: 'Gestor del cobro', field: 'gestionCobroSelect', format: 'badge'},
      {label: 'Pagador del servicio', field: 'pagadorServicio', format: 'badge'},
      {label: 'Día de cobro', field: 'día cobro inq', format: 'number'}, // verificar binding
      {label: 'Búsqueda bancos', field: 'busquedaBancos', format: 'badge'},
      {label: 'Aviso búsqueda bancos', field: 'avisoBusquedaBancos', format: 'text'},
    ],
  },
  {
    id: 'agencia-vinculada',
    title: 'Agencia vinculada',
    summary: ['Agencia', 'Agente'],
    fields: [
      {label: 'Agencia', field: 'linkAgencia', format: 'text'},
      {label: 'Agente', field: 'id_agente_link', format: 'text'},
      {label: 'tipoAgencia', field: null, format: 'text'}, // verificar binding (lookup)
    ],
  },
  {
    id: 'fechas',
    title: 'Fechas de la operación',
    summary: ['Fecha cierre', 'Fecha inicio', 'Fecha fin'],
    fields: [
      {label: 'Fecha cierre', field: 'fechaCierre', format: 'date'},
      {label: 'Fecha inicio', field: 'fecha inicio', format: 'date'},
      {label: 'Fecha fin', field: 'fecha fin', format: 'date'},
      {label: 'Fecha firma', field: 'fecha firma', format: 'date'},
      {label: 'Periodos de fin', field: 'linkPeriodoFin', format: 'text'},
    ],
  },
  {
    id: 'documentos',
    title: 'Documentos de operación',
    summary: ['Sistema de docs', 'Canal de envío'],
    fields: [
      {label: 'Sistema de docs', field: 'signingSystem', format: 'badge'},
      {label: 'Canal de envío', field: 'canal envio', format: 'badge'},
      {label: 'Errores de creación', field: 'CheckDatosArray', format: 'text'},
    ],
  },
  {
    id: 'contrato-servicio',
    title: 'Contrato de servicio',
    summary: ['Estado'],
    fields: [
      {label: 'Estado', field: 'contrato STATUS select', format: 'badge'},
      {label: 'Última modificación del estado', field: 'fechaModificacionStatusContrato', format: 'date'},
    ],
  },
  {
    id: 'adenda',
    title: 'Adenda',
    summary: ['Estado'],
    fields: [
      {label: 'Estado', field: 'contrato ADENDA STATUS select', format: 'badge'},
      {label: 'Última modificación del estado', field: 'fechaModificacionStatusAdenda', format: 'date'},
    ],
  },
  {
    id: 'sepa',
    title: 'SEPA',
    summary: ['Estado'],
    fields: [
      {label: 'Pagador', field: 'linkPagador', format: 'text'},
      {label: 'Estado', field: 'contrato SEPA STATUS select', format: 'badge'},
      {label: 'Última modificación del estado', field: 'fechaModificacionStatusSEPA', format: 'date'},
    ],
  },
  {
    id: 'poliza',
    title: 'Póliza',
    summary: ['Tipo', 'Coste de la póliza'],
    fields: [
      {label: 'Identificador', field: 'numero poliza', format: 'text'},
      {label: 'Tipo', field: 'tipo poliza', format: 'badge'},
      {label: 'Fecha fin', field: 'fecha fin poliza', format: 'date'},
      {label: 'Precio póliza (prima)', field: 'polizaCoberturaPorcentaje', format: 'percent'},
      {label: 'Coste de la póliza', field: 'polizaCosteCalculo', format: 'currency'},
    ],
  },
  {
    id: 'continuidad',
    title: 'Continuidad de la operación',
    summary: ['Fecha vencimiento', 'Días para vencimiento'],
    fields: [
      {label: 'Fecha vencimiento', field: 'fecha vencimiento', format: 'text'},
      {label: 'Días para vencimiento', field: 'DiasParaVencimiento', format: 'number'},
      {label: 'Elegir siguiente deal', field: 'dealSiguienteSelect', format: 'badge'},
      {label: 'Siguiente', field: 'dealRelacionSiguiente', format: 'text'},
    ],
  },
  {
    id: 'baja',
    title: 'Baja de la operación',
    summary: ['Estado de carencia', 'Baja póliza'],
    fields: [
      {label: 'Baja póliza', field: 'bajaPolizaSeguro', format: 'badge'},
      {label: 'Estado de carencia', field: 'operacionEstadoCarencia', format: 'badge'},
      {label: 'Stop transferencia propietario', field: 'stopTransferenciaPropietario', format: 'badge'},
      {label: 'Stop cobro inquilino', field: 'stopCobroInquilino', format: 'badge'},
    ],
  },
  {
    id: 'sincronizacion-bancaria',
    title: 'Sincronización bancaria',
    summary: ['Estado bancos', 'Alquiler'],
    fields: [
      {label: 'Estado bancos', field: 'estadoBancario', format: 'badge'},
      {label: 'Alquiler', field: 'alquiler mensual', format: 'currency'},
      {label: 'Sync source', field: '_syncSource', format: 'text'},
    ],
  },
  // --- Participantes: 1 bloque con 3 columnas por tipo.
  // Inquilinos y avalistas se agrupan por estudio (contacto.estudiosAffi). ---
  {
    id: 'participantes',
    title: 'Participantes',
    type: 'participants',
    propietariosField: 'id_propietariolink',
    inquilinosField: 'inquilino link',
    avalistasField: 'id_avalista link',
    estudiosField: 'linkEstudios',
    linkFields: ['id_propietariolink', 'inquilino link', 'id_avalista link', 'linkEstudios'],
    validationFields: ['CheckDatosPropietario', 'CheckDatosInquilino', 'CheckDatosAvalista'],
  },
  {
    id: 'pre-scoring',
    title: 'Pre-scoring y scoring',
    summary: ['Pre-scoring', 'Scoring'],
    fields: [
      {label: 'Pre-scoring', field: 'prescoring', format: 'badge'},
      {label: 'Scoring', field: 'scoring', format: 'badge'},
    ],
  },
  {
    id: 'scoring-affi',
    title: 'Scoring Affi',
    type: 'links',
    linkField: 'linkEstudios',
    linkedTableId: ESTUDIOS_TABLE_ID,
  },
  {
    id: 'inmueble',
    title: 'Inmueble',
    type: 'links',
    linkField: 'id_inmueble',
    linkedTableId: INMUEBLE_TABLE_ID,
  },
];

// Agrupación del índice en categorías (2 niveles). Las secciones de personas/scoring
// (F3) se añadirán a la categoría 'personas' cuando existan.
export const CATEGORIES = [
  {id: 'comercial', label: 'Comercial', sectionIds: ['datos-basicos', 'comision-producto', 'comision-agencia', 'condiciones-economicas', 'agencia-vinculada', 'inmueble']},
  {id: 'personas', label: 'Personas', sectionIds: ['participantes', 'pre-scoring', 'scoring-affi']},
  {id: 'bancario', label: 'Bancario', sectionIds: ['operativa-bancaria', 'sincronizacion-bancaria']},
  {id: 'documentos', label: 'Documentos', sectionIds: ['documentos', 'contrato-servicio', 'adenda', 'sepa', 'poliza']},
  {id: 'ciclo-vida', label: 'Ciclo de vida', sectionIds: ['fechas', 'continuidad', 'baja']},
];

// Campos extra a suscribir (los de SECTIONS además de los básicos/validación).
function subscribe(name) {
  if (name && !SUBSCRIBED_FIELDS.includes(name)) SUBSCRIBED_FIELDS.push(name);
}
for (const s of SECTIONS) {
  for (const f of s.fields || []) subscribe(f.field);
  subscribe(s.linkField);
  subscribe(s.validationField);
  for (const f of s.linkFields || []) subscribe(f);
  for (const f of s.validationFields || []) subscribe(f);
  for (const col of s.columns || []) subscribe(col.linkField);
}

// Lee un cell value como string seguro (sin romper con lookups/objetos).
export function cellString(record, fieldName) {
  if (!record) return '';
  try {
    const v = record.getCellValue(fieldName);
    if (v == null) return '';
    if (Array.isArray(v)) return v.map((x) => (x && x.name) || (x && x.text) || String(x)).join(', ');
    if (typeof v === 'object') return v.name || v.text || '';
    return String(v);
  } catch {
    return '';
  }
}

// Lee un campo de linked records como array de {id, name} (vacío si no hay).
export function linkedCells(record, fieldName) {
  if (!record || !fieldName) return [];
  try {
    const v = record.getCellValue(fieldName);
    return Array.isArray(v) ? v : v ? [v] : [];
  } catch {
    return [];
  }
}
export function linkedCount(record, fieldName) {
  return linkedCells(record, fieldName).length;
}

const EUR = new Intl.NumberFormat('es-ES', {style: 'currency', currency: 'EUR'});

// Devuelve {text, kind} listo para render. kind === 'empty' cuando no hay valor.
export function formatCell(record, field, format) {
  if (!field) return {text: '— (binding pendiente)', kind: 'todo'};
  let raw;
  try {
    raw = record ? record.getCellValue(field) : null;
  } catch {
    return {text: '— (campo no existe)', kind: 'todo'};
  }
  if (raw == null || raw === '') return {text: '–', kind: 'empty'};
  switch (format) {
    case 'currency':
      return {text: EUR.format(Number(raw)), kind: 'value'};
    case 'percent':
      return {text: `${(Number(raw) * 100).toFixed(2)}%`, kind: 'value'};
    case 'number':
      return {text: String(raw), kind: 'value'};
    case 'date': {
      // getCellValue de un date devuelve ISO 'YYYY-MM-DD' (o datetime). Formatear DD/MM/YYYY
      // manualmente (NO new Date(): en ES desplaza el día). Si no es ISO, mostrar el texto tal cual.
      const s = String(raw).slice(0, 10);
      const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      return {text: m ? `${m[3]}/${m[2]}/${m[1]}` : cellString(record, field), kind: 'value'};
    }
    case 'badge':
      return {text: cellString(record, field), kind: 'badge'};
    default:
      return {text: cellString(record, field), kind: 'value'};
  }
}

// Trocea una formula de errores ("Faltan datos en…") en líneas individuales.
export function parseErrorLines(raw) {
  if (!raw) return [];
  return String(raw)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

// Estado de una sección: 'ok' | 'warn' | 'partial' | 'empty' + count.
// - Con validationField: warn si la formula de errores trae líneas (count = nº líneas).
// - Sin él: completitud por nº de campos con valor.
export function sectionStatus(record, section) {
  if (section.validationField) {
    const errs = parseErrorLines(cellString(record, section.validationField));
    return errs.length ? {level: 'warn', count: errs.length} : {level: 'ok', count: 0};
  }
  if (section.type === 'participants') {
    const errs = (section.validationFields || []).flatMap((vf) => parseErrorLines(cellString(record, vf)));
    return errs.length ? {level: 'warn', count: errs.length} : {level: 'ok', count: 0};
  }
  if (section.type === 'links') {
    const n = linkedCount(record, section.linkField);
    return {level: n > 0 ? 'ok' : 'empty', count: n};
  }
  const real = (section.fields || []).filter((f) => f.field);
  const total = real.length;
  let filled = 0;
  for (const f of real) {
    const {kind} = formatCell(record, f.field, f.format);
    if (kind === 'value' || kind === 'badge') filled++;
  }
  if (total === 0 || filled === 0) return {level: 'empty', count: 0};
  if (filled === total) return {level: 'ok', count: 0};
  return {level: 'partial', count: total - filled};
}

// Agregado de las 4 formulas de validación del deal (deal/propietario/inquilino/inmueble).
export function dealValidation(record) {
  const groups = [
    {key: 'deal', label: 'Deal', field: VALIDATION_FIELDS.deal},
    {key: 'propietario', label: 'Propietarios', field: VALIDATION_FIELDS.propietario},
    {key: 'inquilino', label: 'Inquilinos', field: VALIDATION_FIELDS.inquilino},
    {key: 'inmueble', label: 'Inmueble', field: VALIDATION_FIELDS.inmueble},
  ].map((g) => ({...g, errors: parseErrorLines(cellString(record, g.field))}));
  const issues = groups.reduce((n, g) => n + g.errors.length, 0);
  return {groups, issues, ok: issues === 0};
}

// Resumen para el medidor del sidebar: secciones completas / total + incidencias de validación.
export function overallStatus(record, sections) {
  let ok = 0;
  for (const s of sections) {
    if (sectionStatus(record, s).level === 'ok') ok++;
  }
  return {ok, total: sections.length, issues: dealValidation(record).issues};
}
