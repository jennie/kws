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
  const t = venueTime(value)
  if (Number.isNaN(t)) return value
  return new Date(t).toISOString()
}

// Concert and event times are stored as Kitchener wall-clock strings with no
// offset ("2026-10-16T19:30:00"). `new Date()` reads those in whatever zone the
// code runs in (UTC at build, the visitor's zone in the browser), so anything
// that needs the actual instant goes through venueTime instead.
const venueClock = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Toronto',
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
})

// Kitchener's UTC offset in ms at a given instant (negative: west of Greenwich).
function venueOffset(at: number) {
  const p = Object.fromEntries(venueClock.formatToParts(at).map((x) => [x.type, x.value]))
  return Date.UTC(+p.year!, +p.month! - 1, +p.day!, +p.hour!, +p.minute!, +p.second!) - at
}

export function venueTime(value?: string) {
  if (!value) return NaN
  const wall = Date.parse(`${value}Z`)
  if (Number.isNaN(wall)) return NaN
  // The offset at the first guess is the right one except within hours of a
  // DST change; taking it a second time from the corrected instant settles that.
  return wall - venueOffset(wall - venueOffset(wall))
}

// Nuxt Content returns null, not undefined, for a concert without performances.
type ConcertDates = { date: string; performances?: { date: string }[] | null }

// Performances that haven't started yet, earliest first.
export function upcomingPerformances<P extends { date: string }>(performances: P[] | null | undefined, now: number) {
  return (performances ?? [])
    .filter((p) => venueTime(p.date) >= now)
    .sort((a, b) => venueTime(a.date) - venueTime(b.date))
}

// Concerts with a show still to come, ordered by that next show. Touring
// concerts list every show in `performances` and `date` is only the first, so
// a weekend run stays listed until its last show and sorts by the next one.
export function upcomingConcerts<C extends ConcertDates>(concerts: C[], now: number) {
  return concerts
    .map((concert) => {
      const dates = concert.performances?.length ? concert.performances.map((p) => p.date) : [concert.date]
      const ahead = dates.map(venueTime).filter((t) => t >= now)
      return { concert, next: ahead.length ? Math.min(...ahead) : NaN }
    })
    .filter(({ next }) => !Number.isNaN(next))
    .sort((a, b) => a.next - b.next)
    .map(({ concert }) => concert)
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
