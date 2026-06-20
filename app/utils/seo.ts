// Final public domain. Used for canonical links and absolute Open Graph image
// URLs, which must be fully qualified for crawlers and social scrapers. This is
// the cutover target (www.kwsymphony.com), not the interim netlify.app host.
export const SITE_URL = 'https://www.kwsymphony.com'

export const absUrl = (path: string) => `${SITE_URL}${path}`

// Crop a concert's portrait/landscape photo to the 1200x630 OG ratio via the
// Netlify Image CDN. The transform endpoint runs on the deployed site (it 404s
// in local dev/preview, which is fine since OG is only scraped from production).
export const ogConcertImage = (path: string) =>
  `${SITE_URL}/.netlify/images?url=${encodeURIComponent(path)}&w=1200&h=630&fit=cover`
