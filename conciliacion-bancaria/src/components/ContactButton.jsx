import { ADVANCING_CONTACT_URL } from '../config/constants'

export default function ContactButton() {
  return (
    <div className="pb-8 flex justify-center">
      <a
        href={ADVANCING_CONTACT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-6 py-3 border-2 border-royal text-royal rounded-full text-sm font-medium hover:bg-royal hover:text-white transition-colors duration-200"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        Contactar con Advancing
      </a>
    </div>
  )
}
