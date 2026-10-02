// Venue facts from research/venue.json (Google listing, Oct 2026) and research/tripadvisor.json.
export const VENUE = {
  name: 'La Dolce Isola',
  address: 'Via Michele Bianchi, 30',
  city: '87029 Scalea (CS)',
  phoneDisplay: '0985 920136',
  phoneHref: 'tel:+390985920136',
  whatsappHref: 'https://wa.me/393473577381',
  email: 'ladolceisola30@gmail.com',
  instagram: 'https://www.instagram.com/ladolceisola/',
  facebook: 'https://www.facebook.com/profile.php?id=100064050037616',
  mapsHref: 'https://maps.app.goo.gl/hkU6QyTHtpMeHStd8',
  directionsHref:
    'https://www.google.com/maps/dir/?api=1&destination=La+Dolce+Isola+Scalea&destination_place_id=ChIJW17XmiMePxMRJQwxu_nTm08',
  mapsEmbed:
    'https://www.google.com/maps?q=La+Dolce+Isola,+Via+Michele+Bianchi+30,+Scalea&ll=39.8147921,15.7907844&z=17&output=embed',
  hours: '07:00 – 03:00',
  closedDay: 'mercoledì',
  closedDayEn: 'Wednesday',
  google: { rating: 4.3, count: 575 },
  tripadvisor: {
    rating: 4.3,
    count: 125,
    rank: 20,
    of: 103,
    href: 'https://www.tripadvisor.it/Restaurant_Review-g194909-d6965643-Reviews-La_Dolce_Isola-Scalea_Province_of_Cosenza_Calabria.html',
  },
} as const

/** Prefix a public asset path with Vite's base (GitHub Pages sub-path). */
export const asset = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`
