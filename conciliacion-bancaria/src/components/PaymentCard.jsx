export default function PaymentCard({ data }) {
  const formattedAmount = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: data.currency,
  }).format(data.amount)

  return (
    <div className="px-4 sm:px-6 -mt-8 relative z-10">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Concepto destacado */}
        <div className="bg-royal/5 px-6 pt-6 pb-4 sm:px-8 sm:pt-8 sm:pb-5">
          <p className="text-xs uppercase tracking-wider text-royal/50 font-medium mb-1">Concepto</p>
          <p className="text-lg sm:text-xl font-semibold text-royal leading-snug">{data.concept}</p>
        </div>

        <div className="px-6 py-5 sm:px-8 sm:py-6 space-y-5 sm:space-y-6">
          {/* Detalles */}
          <div className="space-y-4">
            <InfoRow
              label="Inmueble"
              value={data.property}
              icon={
                <svg className="w-4 h-4 text-royal/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              }
            />
            <InfoRow
              label="N.º Operación"
              value={data.operationNumber}
              icon={
                <svg className="w-4 h-4 text-royal/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              }
            />
          </div>

          {/* Importe */}
          <div className="border-t border-gray-100 pt-5 sm:pt-6">
            <p className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-2">Importe a pagar</p>
            <p className="text-4xl sm:text-5xl font-bold text-royal tracking-tight">{formattedAmount}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value, icon }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
        <p className="text-sm sm:text-base font-medium text-gray-800 break-words">{value}</p>
      </div>
    </div>
  )
}
