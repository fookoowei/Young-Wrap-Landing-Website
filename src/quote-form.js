export function buildWhatsAppUrl(waBase, { name, car, service, message }) {
  const lines = [`Hi Young Wrap! I'd like a quote.`,
    name && `Name: ${name}`, car && `Item: ${car}`, service && `Service: ${service}`, message && `Message: ${message}`,
  ].filter(Boolean)
  return `${waBase.split('?')[0]}?text=${encodeURIComponent(lines.join('\n'))}`
}

export function initQuoteForm(shop) {
  const form = document.getElementById('quote-form')
  if (!form) return
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(form))
    if (!form.reportValidity()) return
    window.open(buildWhatsAppUrl(shop.whatsappUrl, data), '_blank', 'noopener')
  })
}
