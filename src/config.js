// Single source of truth for shop data. PLACEHOLDER values marked — swap when owner provides.
const phoneRaw = '+60196002910'

export const SHOP = {
  name: 'Young Wrap',
  phone: phoneRaw,
  phoneDisplay: '+60 19-600 2910',
  whatsappUrl: `https://wa.me/${phoneRaw.replace(/[^0-9]/g, '')}`,
  addressLine: '42, Jalan Anggerik Vanilla Ad 31/Ad, Kota Kemuning, 40460 Shah Alam, Selangor',
  mapsUrl: 'https://www.google.com/maps?um=1&ie=UTF-8&fb=1&gl=my&sa=X&geocode=KS_rhdpWs80xMT6ZdCfJ09BX&daddr=42,+Jalan+Anggerik+Vanilla+Ad+31/Ad,+Kota+Kemuning,+40460+Shah+Alam,+Selangor',
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
