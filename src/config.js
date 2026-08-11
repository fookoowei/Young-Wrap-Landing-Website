// Single source of truth for shop data. PLACEHOLDER values marked — swap when owner provides.
const phoneRaw = '+60196002910'

export const SHOP = {
  name: 'Young Wrap',
  phone: phoneRaw,
  phoneDisplay: '+60 19-600 2910',
  whatsappUrl: `https://wa.me/${phoneRaw.replace(/[^0-9]/g, '')}`,
  addressLine: '42, Jalan Anggerik Vanilla Ad 31/Ad, Kota Kemuning, 40460 Shah Alam, Selangor',
  mapsUrl: 'https://www.google.com/maps?sca_esv=64b268b11d0571a2&output=search&q=young+wrap&source=lnms&fbs=ABfTbFVyMZGZf1hfvX9uKjN_-G8c4u0nXx4bEIpwm1lnNH832SMIiTl3t-JZ4hGJOxPbHYQR84vEJkyW62ul7Q3Bkhu9i-p_ALr7slx3OYYzZdb8If6UlQdzA3eae6DyEgB_K-Oo1DvwvNqNRv3gdbsoRfWHVTF95OvL34AXg7os5ZtnLg-hyVSE-sxRQ5Br450XBMGBoSj7SjsaRwd0OfiTicAThWwJFQ&entry=mc&ved=1t:200715&ictx=111',
  instagram: 'https://www.instagram.com/young.wrap/',
  facebook: 'https://www.facebook.com/people/YoungWrap/61552718845372/',
  kol: {
    name: 'Charles Tee',
    handle: '@charlest33',
    url: 'https://www.instagram.com/charlest33/',
    postUrl: 'https://www.instagram.com/p/DbX3XIbO2lg/', // PLACEHOLDER — exact collab post URL
  },
}
