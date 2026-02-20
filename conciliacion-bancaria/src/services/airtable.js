import { AIRTABLE_BASE_URL, AIRTABLE_TABLE_NAME } from '../config/constants'

export async function fetchPaymentData(recordID) {
  const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY
  const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID

  if (!apiKey || !baseId) {
    throw new Error('Faltan las variables de entorno VITE_AIRTABLE_API_KEY o VITE_AIRTABLE_BASE_ID')
  }

  const url = `${AIRTABLE_BASE_URL}/${baseId}/${AIRTABLE_TABLE_NAME}/${recordID}`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('No se encontró la operación de pago solicitada.')
    }
    throw new Error('Error al obtener los datos de pago. Inténtalo de nuevo más tarde.')
  }

  const data = await response.json()

  return {
    recordId: data.id,
    concept: data.fields.concept || 'Sin concepto',
    amount: data.fields.moneyAmount ? data.fields.moneyAmount / 100 : 0,
    currency: data.fields.moneyCurrency || 'EUR',
    property: data.fields.inmueble || 'No especificado',
    paymentMethod: data.fields.paymentMethod || null,
    status: data.fields.status || 'Sin crear',
    widgetURL: data.fields.clientWidgetURL || null,
    creditCardEnabled: data.fields.enableCreditCard === 'true',
    operationNumber: data.fields.index || data.id,
    webhookCreateTPV: data.fields.webhookCreateTPV || null,
  }
}

export async function createTPVWidget(webhookURL) {
  const response = await fetch(webhookURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Error al generar el pago. Inténtalo de nuevo más tarde.')
  }

  const data = await response.json()

  const widgetURL = data.clientWidgetURL || data.clientWidgetUrl || data.url
  if (!widgetURL) {
    throw new Error('No se recibió la URL del widget de pago.')
  }

  return widgetURL
}
