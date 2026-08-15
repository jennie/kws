// Shared concert date + venue formatting. Dates render in the en-CA locale.

export function longDate(value?: string) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

export function shortDate(value?: string) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-CA', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
}

export function timeOf(value?: string) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' })
}

export function isoDate(value?: string) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toISOString()
}

// Formats the photo credit for a figcaption. The hero shows this alone. The
// gallery prepends the image `description`, so who is in the photograph is
// readable without a screen reader — revisit with Katherine, since the
// 2026-08-10 call was that `description` stays alt text only.
export function imageCaption(credit?: string) {
  return credit ? `Photo: ${credit}` : ''
}

// images[0] is the hero, and every surface that shows one image shows this one:
// the detail-page lead, the card thumbnail, the OG image and the JSON-LD image.
// images[1..n] are the gallery. The client controls the order in Studio, so keep
// the rule here rather than re-deriving `images[0]` at each call site.
export function heroImage<T>(concert?: { images?: T[] } | null): T | undefined {
  return concert?.images?.[0]
}

// Venue stored as "Hall name, City" — split into hall name and "City, ON".
export function splitVenue(value?: string): { name: string; city: string } {
  const parts = value?.split(',') ?? []
  return {
    name: parts[0]?.trim() ?? '',
    city: parts.length > 1 ? `${parts.slice(1).join(',').trim()}, ON` : ''
  }
}
