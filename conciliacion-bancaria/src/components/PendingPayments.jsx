// TODO: Conectar con Airtable para mostrar cuotas pendientes reales
// Se activa con el parámetro de URL ?pendientes=true

const MOCK_PENDING = [
  { id: 1, concept: 'Cuota Servicio — Enero 2025', amount: 150.50, status: 'pending' },
  { id: 2, concept: 'Cuota Servicio — Diciembre 2024', amount: 150.50, status: 'pending' },
  { id: 3, concept: 'Cuota Servicio — Noviembre 2024', amount: 150.50, status: 'overdue' },
]

export default function PendingPayments() {
  return (
    <div className="px-4 sm:px-6 mt-5 sm:mt-6">
      <div className="max-w-lg mx-auto">
        {/* Header del módulo */}
        <div className="flex items-center gap-2 mb-3 px-1">
          <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-sm font-semibold text-gray-700">Cuotas pendientes anteriores</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden divide-y divide-gray-50">
          {MOCK_PENDING.map((item) => (
            <div key={item.id} className="px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{item.concept}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                    item.status === 'overdue'
                      ? 'bg-red-50 text-red-600'
                      : 'bg-orange-50 text-orange-600'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      item.status === 'overdue' ? 'bg-red-400' : 'bg-orange-400'
                    }`} />
                    {item.status === 'overdue' ? 'Vencida' : 'Pendiente'}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-base sm:text-lg font-bold text-royal">
                  {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(item.amount)}
                </p>
              </div>
            </div>
          ))}

          {/* Total pendiente */}
          <div className="px-5 py-4 sm:px-6 sm:py-5 bg-royal/5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-royal/60">Total pendiente</p>
              <p className="text-lg sm:text-xl font-bold text-royal">
                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(
                  MOCK_PENDING.reduce((sum, item) => sum + item.amount, 0)
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Nota placeholder */}
        <p className="text-xs text-gray-400 text-center mt-3 px-4">
          Contacta con Advancing para regularizar tus cuotas pendientes
        </p>
      </div>
    </div>
  )
}
