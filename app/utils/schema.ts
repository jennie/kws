// schema.org JSON-LD builders. Concert pages emit MusicEvent (one event per
// performance) to qualify for Google's event rich results; the home page emits
// a MusicGroup for the organisation knowledge panel. splitVenue, absUrl and
// SITE_URL are auto-imported from the sibling util files.

const ORGANISATION = {
  '@type': 'MusicGroup',
  name: 'Kitchener-Waterloo Symphony',
  alternateName: 'KWS',
  url: SITE_URL,
}

type Stop = { date: string; venue: string; ticketUrl?: string; ticketProvider?: string }
type Concert = {
  title: string
  date: string
  venue: string
  image: string
  description: string
  conductor?: string
  artists?: { name: string; role: string }[]
  ticketUrl?: string
  ticketProvider?: string
  performances?: Stop[]
}

// JSON embedded in an inline <script> must not contain a literal "<" that could
// close the tag early. JSON.stringify doesn't escape it, so do it here.
export const ldJson = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c')

function place(venue: string) {
  const { name, city } = splitVenue(venue)
  const address: Record<string, string> = {
    '@type': 'PostalAddress',
    addressRegion: 'ON',
    addressCountry: 'CA',
  }
  if (city) address.addressLocality = city.replace(/,\s*ON$/, '')
  return { '@type': 'Place', name, address }
}

function offer(url?: string, provider?: string) {
  if (!url) return undefined
  return {
    '@type': 'Offer',
    url,
    availability: 'https://schema.org/InStock',
    ...(provider ? { seller: { '@type': 'Organization', name: provider } } : {}),
  }
}

function performers(concert: Concert) {
  const list: object[] = [ORGANISATION]
  if (concert.conductor) list.push({ '@type': 'Person', name: concert.conductor })
  for (const a of concert.artists ?? []) list.push({ '@type': 'Person', name: a.name })
  return list
}

export function concertJsonLd(concert: Concert) {
  const base = {
    '@context': 'https://schema.org',
    '@type': 'MusicEvent',
    name: concert.title,
    description: concert.description,
    image: [absUrl(concert.image)],
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    performer: performers(concert),
    organizer: ORGANISATION,
  }
  // Touring concerts list their stops in `performances`; single-date concerts
  // carry date/venue/tickets at the top level. Emit one MusicEvent per stop.
  const stops: Stop[] = concert.performances?.length
    ? concert.performances
    : [{ date: concert.date, venue: concert.venue, ticketUrl: concert.ticketUrl, ticketProvider: concert.ticketProvider }]

  const events = stops.map((stop) => {
    const offers = offer(stop.ticketUrl, stop.ticketProvider)
    // startDate is the raw local venue time (valid ISO 8601 without offset);
    // converting to UTC here would be wrong since the build runs in UTC.
    return {
      ...base,
      startDate: stop.date,
      location: place(stop.venue),
      ...(offers ? { offers } : {}),
    }
  })
  return events.length === 1 ? events[0] : events
}

export function organisationJsonLd() {
  return {
    '@context': 'https://schema.org',
    ...ORGANISATION,
    description:
      'Concerts and events from the Kitchener-Waterloo Symphony, serving the Waterloo Region for 75 years.',
    logo: absUrl('/images/kws-logo.svg'),
    areaServed: 'Waterloo Region, Ontario',
  }
}
