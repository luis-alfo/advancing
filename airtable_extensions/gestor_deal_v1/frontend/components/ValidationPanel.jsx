// Vista "Resumen" (acordeón): consolida los "Faltan datos en…".
// Colapsado → contadores por grupo. Expandido → checklist completa.
import React, {useMemo} from 'react';
import {ListChecks} from 'lucide-react';
import {dealValidation} from '../lib/fields';
import {VALIDATION_ICONS} from '../lib/icons';
import AccordionCard from './AccordionCard';

export default function ValidationPanel({record, open, onToggle}) {
  const {groups, issues, ok} = useMemo(() => dealValidation(record), [record]);
  const withErrors = groups.filter((g) => g.errors.length > 0);

  const summary = ok ? (
    <span className="text-sm text-mint-700 font-semibold">✓ Todos los datos completos</span>
  ) : (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
      {withErrors.map((g) => {
        const Icon = VALIDATION_ICONS[g.key];
        return (
          <span key={g.key} className="inline-flex items-center gap-1.5 text-sm text-slate-600">
            {Icon && <Icon size={14} className="text-slate-400" strokeWidth={2} />}
            {g.label}
            <span className="text-[11px] px-1.5 rounded bg-amber-100 text-amber-700 tabular-nums font-semibold">
              {g.errors.length}
            </span>
          </span>
        );
      })}
    </div>
  );

  return (
    <AccordionCard
      icon={ListChecks}
      title="Resumen de validación"
      status={ok ? {level: 'ok'} : {level: 'warn', count: issues}}
      open={open}
      onToggle={onToggle}
      summary={summary}
    >
      {ok ? (
        <div className="px-5 py-7 text-center">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-mint-100 text-mint-700 text-xl">✓</div>
          <p className="mt-2.5 text-sm text-mint-700 font-semibold">El deal tiene todos los datos. Listo para avanzar.</p>
        </div>
      ) : (
        <div className="divide-y divide-line">
          {withErrors.map((g) => {
            const Icon = VALIDATION_ICONS[g.key];
            return (
              <div key={g.key} className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  {Icon && <Icon size={15} className="text-slate-400" strokeWidth={2} />}
                  <span className="text-sm font-bold text-ink">{g.label}</span>
                  <span className="text-[11px] px-1.5 rounded bg-amber-100 text-amber-700 tabular-nums font-semibold">
                    {g.errors.length}
                  </span>
                </div>
                <ul className="space-y-1.5 pl-1">
                  {g.errors.map((e, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <span className="mt-[5px] w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span>{e}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </AccordionCard>
  );
}
