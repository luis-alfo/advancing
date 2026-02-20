export default function WidgetPlaceholder() {
  // TODO: Integrar con Make webhook para obtener widget URL de Unnax
  // El webhook de Make generará el widget y devolverá la clientWidgetURL
  // que se cargará en un iframe dentro de este contenedor
  return (
    <div className="mx-4 mt-4">
      <div className="max-w-lg mx-auto border-2 border-dashed border-royal/20 rounded-2xl bg-white p-8 flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-royal/5 flex items-center justify-center">
          <svg className="w-6 h-6 text-royal/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <p className="text-royal/40 text-sm text-center">
          El widget de pago se cargará aquí
        </p>
      </div>
    </div>
  )
}
