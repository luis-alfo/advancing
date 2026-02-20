export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-10 h-10 border-4 border-royal/20 border-t-royal rounded-full animate-spin" />
      <p className="text-royal/60 text-sm">Cargando datos de pago...</p>
    </div>
  )
}
