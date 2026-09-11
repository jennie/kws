// Orchestra roster ordering. Section and instrument order are the standard
// orchestral convention, held here rather than in the data so the roster can't
// accidentally reorder it. Only the order within an instrument is data-driven.

export interface Musician {
  name: string
  section: string
  instrument: string
  chair?: string
  photo?: string
  order?: number
}

export interface InstrumentGroup {
  instrument: string
  musicians: Musician[]
}

export interface SectionGroup {
  section: string
  instruments: InstrumentGroup[]
}

export const SECTION_ORDER = ['Strings', 'Woodwinds', 'Brass', 'Percussion', 'Harp & Keyboard']

export const INSTRUMENT_ORDER: Record<string, string[]> = {
  'Strings': ['First Violin', 'Second Violin', 'Viola', 'Cello', 'Bass'],
  'Woodwinds': ['Flute', 'Oboe', 'Clarinet', 'Bassoon'],
  'Brass': ['Horn', 'Trumpet', 'Trombone', 'Tuba'],
  'Percussion': ['Timpani', 'Percussion'],
  'Harp & Keyboard': ['Harp', 'Keyboard']
}

// Values missing from a fixed order list sort after every listed one rather
// than disappearing.
function rank(value: string, order: string[]) {
  const i = order.indexOf(value)
  return i === -1 ? order.length : i
}

// The roster lists untitled players by surname, so sort on the last
// whitespace-delimited token, not the full name string.
export function surname(name: string) {
  const parts = name.trim().split(/\s+/)
  return parts[parts.length - 1] ?? ''
}

// Titled chairs first in rank order, then the remainder alphabetically by
// surname. Chairs carry an explicit `order`; everyone else carries none.
export function sortMusicians(list: Musician[]) {
  return [...list].sort((a, b) => {
    if (a.order != null && b.order != null) return a.order - b.order
    if (a.order != null) return -1
    if (b.order != null) return 1
    return (
      surname(a.name).localeCompare(surname(b.name), 'en-CA')
      || a.name.localeCompare(b.name, 'en-CA')
    )
  })
}

function groupBy(list: Musician[], key: (m: Musician) => string) {
  const groups = new Map<string, Musician[]>()
  for (const m of list) {
    const existing = groups.get(key(m))
    if (existing) existing.push(m)
    else groups.set(key(m), [m])
  }
  return groups
}

// Sections, then instruments within a section, then musicians within an
// instrument. Only sections and instruments present in the roster render.
export function groupMusicians(all: Musician[]): SectionGroup[] {
  const bySection = groupBy(all, m => m.section)

  return [...bySection.keys()]
    .sort((a, b) => rank(a, SECTION_ORDER) - rank(b, SECTION_ORDER) || a.localeCompare(b, 'en-CA'))
    .map((section) => {
      const byInstrument = groupBy(bySection.get(section)!, m => m.instrument)
      const order = INSTRUMENT_ORDER[section] ?? []
      return {
        section,
        instruments: [...byInstrument.keys()]
          .sort((a, b) => rank(a, order) - rank(b, order) || a.localeCompare(b, 'en-CA'))
          .map(instrument => ({
            instrument,
            musicians: sortMusicians(byInstrument.get(instrument)!)
          }))
      }
    })
}
