// Iconos Lucide por sección / categoría / grupo de validación (sustituyen a los emojis).
import {
  ListChecks,
  FileText,
  Percent,
  Euro,
  Building2,
  Landmark,
  RefreshCw,
  Files,
  FileSignature,
  FilePlus2,
  CreditCard,
  ShieldCheck,
  Calendar,
  Repeat,
  CircleSlash,
  Briefcase,
  Users,
  User,
  Home,
  ClipboardList,
  Gauge,
} from 'lucide-react';

export const SECTION_ICONS = {
  resumen: ListChecks,
  'datos-basicos': FileText,
  'comision-producto': Percent,
  'comision-agencia': Percent,
  'condiciones-economicas': Euro,
  'agencia-vinculada': Building2,
  'operativa-bancaria': Landmark,
  'sincronizacion-bancaria': RefreshCw,
  documentos: Files,
  'contrato-servicio': FileSignature,
  adenda: FilePlus2,
  sepa: CreditCard,
  poliza: ShieldCheck,
  fechas: Calendar,
  continuidad: Repeat,
  baja: CircleSlash,
  participantes: Users,
  'pre-scoring': Gauge,
  'scoring-affi': ClipboardList,
  inmueble: Home,
};

export const CATEGORY_ICONS = {
  comercial: Briefcase,
  bancario: Landmark,
  documentos: Files,
  'ciclo-vida': Repeat,
  personas: Users,
};

export const VALIDATION_ICONS = {
  deal: ClipboardList,
  propietario: Users,
  inquilino: User,
  inmueble: Home,
};
