// The host this deploy is served from (Netlify URL, or the cutover target as a
// fallback). Inlined as a build-time literal via Vite define in nuxt.config, so
// it's a plain constant on server and client alike. Used for canonical links
// and absolute Open Graph image URLs, which must be fully qualified for
// crawlers and social scrapers.
declare const __SITE_URL__: string
export const SITE_URL = __SITE_URL__

export const absUrl = (path: string) => `${SITE_URL}${path}`

// Crop a concert's portrait/landscape photo to the 1200x630 OG ratio via the
// Netlify Image CDN. The transform endpoint runs on the deployed site (it 404s
// in local dev/preview, which is fine since OG is only scraped from production).
export const ogConcertImage = (path: string) =>
  `${SITE_URL}/.netlify/images?url=${encodeURIComponent(path)}&w=1200&h=630&fit=cover`
