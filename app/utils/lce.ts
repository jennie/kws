// Learning & community engagement events. These are not concerts: the day and
// the clock time are separate fields, the time is optional, and both the
// homepage module and /community read the same list.

type LceEventLike = { date: string; time?: string }

// Compose the stored day and optional time into the local datetime string the
// formatters in concert.ts expect. Never hand `event.date` to a formatter
// directly: a bare "YYYY-MM-DD" parses as UTC midnight and renders as the
// previous day everywhere west of Greenwich.
export function eventDateTime(event: LceEventLike) {
  return `${event.date}T${event.time ?? '00:00'}:00`
}

// One definition of the upcoming/past boundary for both pages, one clock
// reading, one pass. Sorting is by the composed datetime because the collection
// query can only order by the day-only `date` field, which leaves same-day
// events in file order. The composed string is fixed-width, so comparing the
// strings orders them chronologically without parsing a Date per comparison.
export function splitLceEvents<T extends LceEventLike>(events: T[], now = Date.now()) {
  const upcoming: T[] = []
  const past: T[] = []
  for (const event of events) {
    const at = new Date(eventDateTime(event)).getTime()
    if (Number.isNaN(at)) continue
    if (at >= now) upcoming.push(event)
    else past.push(event)
  }
  const chronological = (a: T, b: T) => eventDateTime(a).localeCompare(eventDateTime(b))
  upcoming.sort(chronological)
  past.sort(chronological)
  return { upcoming, past }
}
