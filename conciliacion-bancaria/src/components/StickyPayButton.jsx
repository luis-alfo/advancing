import { useState } from 'react'

export default function StickyPayButton({ onClick, amount, currency, disabled }) {
  const formattedAmount = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency,
  }).format(amount)

  const [pressed, setPressed] = useState(false)

  const handleClick = () => {
    if (pressed || disabled) return
    setPressed(true)
    onClick()
  }

  const buttonClass = pressed
    ? 'w-full flex items-center justify-center gap-2.5 bg-royal/80 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 text-base cursor-wait shadow-sm'
    : 'w-full flex items-center justify-center gap-2.5 bg-advancing-green text-royal-dark font-semibold py-4 px-6 rounded-xl hover:brightness-95 active:scale-[0.98] transition-all duration-200 text-base cursor-pointer shadow-sm'

  const buttonClassDesktop = pressed
    ? 'w-full flex items-center justify-center gap-2.5 bg-royal/80 text-white font-semibold py-5 px-6 rounded-xl transition-all duration-200 text-lg cursor-wait shadow-sm'
    : 'w-full flex items-center justify-center gap-2.5 bg-advancing-green text-royal-dark font-semibold py-5 px-6 rounded-xl hover:brightness-95 active:scale-[0.98] transition-all duration-200 text-lg cursor-pointer shadow-sm'

  return (
    <>
      {/* Spacer para que el contenido no quede detrás del botón sticky en mobile */}
      <div className="h-24 sm:hidden" />

      {/* Mobile: sticky bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden">
        <div className="bg-white/80 backdrop-blur-lg border-t border-gray-200 px-4 py-3">
          <button onClick={handleClick} disabled={pressed} className={buttonClass}>
            {pressed ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generando pago...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Pagar {formattedAmount}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Desktop: botón inline */}
      <div className="hidden sm:block px-6 mt-4">
        <div className="max-w-lg mx-auto">
          <button onClick={handleClick} disabled={pressed} className={buttonClassDesktop}>
            {pressed ? (
              <>
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generando pago...
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Pagar con tarjeta — {formattedAmount}
              </>
            )}
          </button>
        </div>
      </div>
    </>
  )
}
