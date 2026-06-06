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

// Venue stored as "Hall name, City" — split into hall name and "City, ON".
export function splitVenue(value?: string): { name: string; city: string } {
  const parts = value?.split(',') ?? []
  return {
    name: parts[0]?.trim() ?? '',
    city: parts.length > 1 ? `${parts.slice(1).join(',').trim()}, ON` : ''
  }
}
