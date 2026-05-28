// Mock del SDK '@airtable/blocks/interface/ui' para el preview local.
// Permite renderizar los COMPONENTES REALES con datos ficticios, sin Airtable ni cert.
// Alias configurado en el comando esbuild (ver scripts npm: preview:build / preview:watch).
import React from 'react';

// ---- Datos ficticios (espejo del deal de muestra recdEihfmaTqj2clC) ----
const MAIN = {
  indexDeal: 'GIOR REAL ESTATE SLU - Av Maestro Rodrigo 45 Es: 6, Pl: 5, Pt: C [60685015928]',
  id_deal: '60685015928',
  'nombre empleado': 'Jordi Aymerich Torregrosa',
  producto: 'mes a mes',
  'tipo contrato': 'NUEVO',
  'canal de entrada': 'B2B2C',
  statusAplicable: '4. LOPD',
  fuenteCreacionEnGestor: 'Creación en gestor',
  'comision producto aplicable (txt)': 'Por defecto producto (6%)',
  'comision producto aplicable': 0.06,
  'comision agencia aplicable (txt)': 'Acordada con agencia',
  'comision agencia aplicable': 0.01,
  'alquiler mensual': 2100,
  IVAAplicaText: 'Sí',
  'comision producto calculo': 1512,
  ComisionProductoConIVA: 1829.52,
  'comision agencia calculo': 252,
  ComisionAgenciaConIVA: 304.92,
  'Importe anual': 25200,
  gestionCobroSelect: 'Advancing',
  pagadorServicio: 'Propietario',
  'día cobro inq': 5,
  busquedaBancos: '',
  avisoBusquedaBancos: '',
  // Personas / inmueble / estudios (linked records)
  id_propietariolink: [{id: 'recC1', name: '- propietario ()'}],
  'inquilino link': [
    {id: 'recC2', name: 'Vitalii Yevtushenko - inquilino'},
    {id: 'recC3', name: 'Olha Yevtushenko - inquilino'},
  ],
  'id_avalista link': [],
  id_inmueble: [{id: 'recI1', name: '- Av Maestro Rodrigo 45 Es: 6, Pl: 5, Pt: C'}],
  linkEstudios: [{id: 'recE0', name: 'Estudio MAIN-001'}],
  prescoring: 'pendiente',
  scoring: 'pendiente',
  CheckDatosAvalista: '',
  // Agencia / fechas / docs / póliza / ciclo de vida
  linkAgencia: [{id: 'recAg1', name: 'GIOR REAL ESTATE SLU'}],
  id_agente_link: [],
  fechaCierre: '2026-05-28',
  'fecha inicio': '',
  'fecha fin': '#ERROR!',
  'fecha firma': '',
  linkPeriodoFin: [],
  'canal envio': '',
  CheckDatosArray: 'Faltan datos en propietario (): Nombre Apellidos Mail\nFaltan datos en inquilino (Vitalii): revisión LOPD Experian Mitek',
  'contrato STATUS select': 'no creado',
  fechaModificacionStatusContrato: '2026-05-28',
  'contrato ADENDA STATUS select': 'no creado',
  fechaModificacionStatusAdenda: '2026-05-28',
  'contrato SEPA STATUS select': 'no creado',
  fechaModificacionStatusSEPA: '2026-05-28',
  linkPagador: [],
  'numero poliza': '',
  'tipo poliza': '',
  'fecha fin poliza': '',
  polizaCoberturaPorcentaje: '',
  polizaCosteCalculo: 0,
  'fecha vencimiento': 'Falta fecha inicio',
  DiasParaVencimiento: '',
  dealSiguienteSelect: '',
  dealRelacionSiguiente: [],
  bajaPolizaSeguro: '',
  operacionEstadoCarencia: '',
  stopTransferenciaPropietario: '',
  stopCobroInquilino: '',
  estadoBancario: '',
  // Validación (formulas de "Faltan datos en…")
  checkDatosDeal: 'Faltan datos en deal: Fecha firma Fecha inicio Día Pago a prop Falta indicar pagador',
  CheckDatosPropietario:
    'Faltan datos en propietario (): Nombre Apellidos Mail Nacionalidad Numero documento Telefono revisión LOPD Experian Mitek',
  CheckDatosInquilino:
    'Faltan datos en inquilino (Vitalii): revisión LOPD Experian Mitek\nFaltan datos en inquilino (Olha): revisión LOPD Experian Mitek',
  CheckDatosInmueble: 'Faltan datos en inmueble: Ciudad, Ref Catastral, CP, Provincia, País, nota simple',
};

// Un deal "completo" (sin incidencias) para ver el estado verde.
const CLEAN = {
  indexDeal: 'ATEMPORAL MONTHLY RENTALS - Carrer de Sales i Ferré 59 [60464662057]',
  id_deal: '60464662057',
  'nombre empleado': 'Arnau Sanchez',
  producto: 'gestión integral',
  'tipo contrato': 'RENOVACIÓN',
  'canal de entrada': 'B2C',
  statusAplicable: '7. Activo',
  fuenteCreacionEnGestor: 'Importación',
  'comision producto aplicable (txt)': 'Por defecto producto (6%)',
  'comision producto aplicable': 0.06,
  'comision agencia aplicable (txt)': 'Sin agencia',
  'comision agencia aplicable': 0,
  'alquiler mensual': 1450,
  IVAAplicaText: 'No',
  'comision producto calculo': 1044,
  ComisionProductoConIVA: 1044,
  'comision agencia calculo': 0,
  ComisionAgenciaConIVA: 0,
  'Importe anual': 17400,
  gestionCobroSelect: 'Advancing',
  pagadorServicio: 'Inquilino',
  'día cobro inq': 1,
  busquedaBancos: 'Encontrado',
  avisoBusquedaBancos: 'OK',
  id_propietariolink: [{id: 'recC4', name: 'Carlos Ruiz - propietario'}],
  'inquilino link': [{id: 'recC5', name: 'María López - inquilino'}],
  'id_avalista link': [{id: 'recC6', name: 'Pedro Gómez - avalista'}],
  id_inmueble: [{id: 'recI2', name: 'Carrer de Sales i Ferré 59'}],
  linkEstudios: [{id: 'recE1', name: 'Estudio 2026-001'}],
  prescoring: 'aprobada',
  scoring: 'aprobada',
  CheckDatosAvalista: '',
  linkAgencia: [],
  id_agente_link: [],
  fechaCierre: '2026-01-15',
  'fecha inicio': '2026-02-01',
  'fecha fin': '2027-01-31',
  'fecha firma': '2026-01-20',
  linkPeriodoFin: [{id: 'recP1', name: 'Ene 2027'}],
  'canal envio': 'Email',
  CheckDatosArray: '',
  'contrato STATUS select': 'creado',
  fechaModificacionStatusContrato: '2026-01-20',
  'contrato ADENDA STATUS select': 'creado',
  fechaModificacionStatusAdenda: '2026-01-20',
  'contrato SEPA STATUS select': 'firmado',
  fechaModificacionStatusSEPA: '2026-01-22',
  linkPagador: [{id: 'recPag1', name: 'María López - inquilino'}],
  'numero poliza': 'POL-2026-0042',
  'tipo poliza': 'Multirriesgo',
  'fecha fin poliza': '2027-01-31',
  polizaCoberturaPorcentaje: 0.03,
  polizaCosteCalculo: 522,
  'fecha vencimiento': '2027-01-31',
  DiasParaVencimiento: 248,
  dealSiguienteSelect: 'Renovar',
  dealRelacionSiguiente: [],
  bajaPolizaSeguro: 'No',
  operacionEstadoCarencia: 'Sin carencia',
  stopTransferenciaPropietario: 'No',
  stopCobroInquilino: 'No',
  estadoBancario: 'Sincronizado',
  checkDatosDeal: '',
  CheckDatosPropietario: '',
  CheckDatosInquilino: '',
  CheckDatosInmueble: '',
};

function makeRecord(id, data) {
  return {
    id,
    getCellValue(name) {
      const v = data[name];
      return v === undefined ? null : v;
    },
    getCellValueAsString(name) {
      const v = data[name];
      return v == null ? '' : String(v);
    },
  };
}

// Contactos vinculados (campos: nombreYapellidos, tipo contacto, email, lopdSystem,
// LOPD STATUS select, kycMitekSelect, kycExperianSelect).
const C = (id, nombre, tipo, email, lopd, mitek, experian, estudio, avalistas) =>
  makeRecord(id, {
    nombreYapellidos: nombre,
    'tipo contacto': tipo,
    email,
    lopdSystem: 'Signaturit',
    'LOPD STATUS select': lopd,
    kycMitekSelect: mitek,
    kycExperianSelect: experian,
    estudiosAffi: estudio || [],
    linkInquilinoAAvalista: avalistas || [],
  });

const E_MAIN = [{id: 'recE0', name: 'Estudio MAIN-001'}];
const E_CLEAN = [{id: 'recE1', name: 'Estudio 2026-001'}];
const CONTACTOS = [
  C('recC1', '', 'propietario', '', 'no creada', 'Pendiente', 'Pendiente'),
  C('recC2', 'Vitalii Yevtushenko', 'inquilino', 'vitaliiyev@gmail.com', 'creado', 'Pendiente', 'Pendiente', E_MAIN, [{id: 'recC7', name: 'Ihor Y. - avalista'}]),
  C('recC3', 'Olha Yevtushenko', 'inquilino', 'olha.yev@gmail.com', 'creado', 'Pendiente', 'Pendiente', E_MAIN),
  C('recC4', 'Carlos Ruiz', 'propietario', 'carlos@ejemplo.com', 'visualizado', 'Aprobado', 'Aprobado'),
  C('recC5', 'María López', 'inquilino', 'maria@ejemplo.com', 'visualizado', 'Aprobado', 'Aprobado', E_CLEAN, [{id: 'recC6', name: 'Pedro Gómez - avalista'}]),
  C('recC6', 'Pedro Gómez', 'avalista', 'pedro@ejemplo.com', 'visualizado', 'Aprobado', 'Aprobado', E_CLEAN),
  C('recC7', 'Ihor Yevtushenko', 'avalista', 'ihor@ejemplo.com', 'no creada', 'Pendiente', 'Pendiente', E_MAIN),
];
const INMUEBLES = [
  makeRecord('recI1', {index: '- Av Maestro Rodrigo 45 Es: 6, Pl: 5, Pt: C'}),
  makeRecord('recI2', {index: 'Carrer de Sales i Ferré 59'}),
];
const ESTUDIOS = [
  makeRecord('recE0', {Name: 'Estudio MAIN-001', status: 'Pendiente'}),
  makeRecord('recE1', {Name: 'Estudio 2026-001', status: 'Aprobado'}),
];

const DEALS = [makeRecord('mockMAIN', MAIN), makeRecord('mockCLEAN', CLEAN)];

const TABLES = {
  tblwx73iceuKNaz68: {name: 'deal', records: DEALS},
  tbl7HVrBNBY9cSXzj: {name: 'contactos', records: CONTACTOS},
  tbl7h27kZ2zSPOTca: {name: 'inmueble', records: INMUEBLES},
  tblMkONwIp92BQHJ6: {name: 'estudios', records: ESTUDIOS},
};

// ---- Hooks mock ----
export function useBase() {
  return {
    getTableByIdIfExists(id) {
      const t = TABLES[id];
      if (!t) return null;
      return {id, name: t.name, getFieldByNameIfExists: (name) => ({id: name, name})};
    },
  };
}

export function useRecords(table) {
  return (table && TABLES[table.id]?.records) || [];
}

export function expandRecord(record) {
  // En el preview no hay Airtable: simulamos la apertura del detalle nativo.
  window.alert('Abriría el detalle nativo del registro: ' + (record && record.id));
}

export function useSearchParams() {
  const [params, setParams] = React.useState({});
  const setSearchParamsAsync = (updater) => {
    setParams((prev) => (typeof updater === 'function' ? updater(prev) : updater));
    return Promise.resolve();
  };
  return {searchParams: params, setSearchParamsAsync};
}

export function initializeBlock() {}
export function useSession() {
  return {};
}
export function useColorScheme() {
  return 'light';
}
