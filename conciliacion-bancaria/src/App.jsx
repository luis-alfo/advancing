import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom'
import Header from './components/Header'
import PaymentCard from './components/PaymentCard'
import StickyPayButton from './components/StickyPayButton'
import PendingPayments from './components/PendingPayments'
import SecurityBadge from './components/SecurityBadge'
import ContactButton from './components/ContactButton'
import LoadingSpinner from './components/LoadingSpinner'
import { fetchPaymentData, createTPVWidget } from './services/airtable'

function Pasarela() {
  const [searchParams] = useSearchParams()
  const recordID = searchParams.get('recordID')
  const showPending = searchParams.get('pendientes') === 'true'

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [payError, setPayError] = useState(null)

  useEffect(() => {
    if (!recordID) {
      setError('No se proporcionó un identificador de operación.')
      setLoading(false)
      return
    }

    fetchPaymentData(recordID)
      .then((paymentData) => {
        setData(paymentData)
        // Si ya existe una clientWidgetURL, redirigir directamente
        if (paymentData.widgetURL) {
          window.location.href = paymentData.widgetURL
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [recordID])

  const handlePay = async () => {
    setPayError(null)

    if (!data.webhookCreateTPV) {
      setPayError('No se puede procesar el pago en este momento.')
      return
    }

    try {
      const widgetURL = await createTPVWidget(data.webhookCreateTPV)
      window.location.href = widgetURL
    } catch (err) {
      setPayError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-warm flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col pb-4">
        {loading && <LoadingSpinner />}

        {error && (
          <div className="mx-4 mt-6">
            <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-gray-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {data && !data.widgetURL && (
          <>
            <PaymentCard data={data} />

            {showPending && <PendingPayments />}

            {payError && (
              <div className="px-4 sm:px-6 mt-4">
                <div className="max-w-lg mx-auto bg-red-50 border border-red-100 rounded-xl p-4 text-center">
                  <p className="text-red-600 text-sm">{payError}</p>
                </div>
              </div>
            )}

            <StickyPayButton
              onClick={handlePay}
              amount={data.amount}
              currency={data.currency}
            />
          </>
        )}

        {data && data.widgetURL && (
          <div className="mx-4 mt-6">
            <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-6 text-center">
              <div className="w-10 h-10 mx-auto mb-3 border-4 border-royal/20 border-t-royal rounded-full animate-spin" />
              <p className="text-gray-600 text-sm">Redirigiendo al pago seguro...</p>
            </div>
          </div>
        )}

        <SecurityBadge />
        <ContactButton />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/pasarela" element={<Pasarela />} />
        <Route path="*" element={<Pasarela />} />
      </Routes>
    </BrowserRouter>
  )
}
