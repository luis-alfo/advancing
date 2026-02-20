import { ADVANCING_LOGO_URL } from '../config/constants'

export default function Header() {
  return (
    <header className="bg-royal w-full pt-8 pb-14 sm:pt-10 sm:pb-16 px-4">
      <div className="max-w-lg mx-auto flex flex-col items-center gap-3 sm:gap-4">
        <img
          src={ADVANCING_LOGO_URL}
          alt="Advancing"
          className="h-8 sm:h-10"
        />
        <h1 className="text-white/80 text-base sm:text-lg font-light tracking-wide">
          Pasarela de Pago
        </h1>
      </div>
    </header>
  )
}
