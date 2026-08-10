// Single source of truth for shop data. PLACEHOLDER values marked — swap when owner provides.
const phoneRaw = '+60123456789' // PLACEHOLDER — real WhatsApp/phone number

export const SHOP = {
  name: 'Young Wrap',
  phone: phoneRaw,
  phoneDisplay: '+60 12-345 6789', // PLACEHOLDER
  whatsappUrl: `https://wa.me/${phoneRaw.replace(/[^0-9]/g, '')}`,
  addressLine: 'Kota Kemuning, Shah Alam, Selangor', // PLACEHOLDER — full street address
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Kota+Kemuning+Shah+Alam', // PLACEHOLDER
  hours: 'Mon–Sat 10:00 AM – 7:00 PM', // PLACEHOLDER
  instagram: 'https://www.instagram.com/young.wrap/',
  facebook: 'https://www.facebook.com/people/YoungWrap/61552718845372/',
  kol: {
    name: 'Charles Tee',
    handle: '@charlest33',
    url: 'https://www.instagram.com/charlest33/',
    postUrl: 'https://www.instagram.com/charlest33/', // PLACEHOLDER — exact collab post URL
  },
}
