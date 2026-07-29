import { describe, expect, it } from 'vitest'
import { groupMusicians, sortMusicians, surname, type Musician } from './musicians'

function m(name: string, section: string, instrument: string, chair?: string, order?: number): Musician {
  return { name, section, instrument, ...(chair ? { chair } : {}), ...(order ? { order } : {}) }
}

const names = (list: Musician[]) => list.map(x => x.name)

describe('surname', () => {
  it('takes the last whitespace-delimited token', () => {
    expect(surname('Bénédicte Lauzière')).toBe('Lauzière')
    expect(surname('Brenna Hardy-Kavanagh')).toBe('Hardy-Kavanagh')
    expect(surname('Marie-Sonja Cotineau')).toBe('Cotineau')
    expect(surname("Kevin O'Donnell")).toBe("O'Donnell")
  })

  it('handles a single-token name', () => {
    expect(surname('Prince')).toBe('Prince')
  })
})

describe('sortMusicians', () => {
  it('puts titled chairs first in rank order, untitled after', () => {
    const list = [
      m('Allene Chomyn', 'Strings', 'First Violin'),
      m('Jung Tsai', 'Strings', 'First Violin', 'Second Associate Concertmaster', 3),
      m('Peter Carter', 'Strings', 'First Violin'),
      m('Bénédicte Lauzière', 'Strings', 'First Violin', 'Concertmaster', 1),
      m('Kenneth Kwan', 'Strings', 'First Violin'),
      m('Anna Luhowy', 'Strings', 'First Violin'),
      m('Lance Ouellette', 'Strings', 'First Violin', 'Associate Concertmaster', 2),
      m('Julia Dixon', 'Strings', 'First Violin')
    ]
    // The untitled tail is the roster's own order: Carter, Chomyn, Dixon, Kwan, Luhowy.
    expect(names(sortMusicians(list))).toEqual([
      'Bénédicte Lauzière',
      'Lance Ouellette',
      'Jung Tsai',
      'Peter Carter',
      'Allene Chomyn',
      'Julia Dixon',
      'Kenneth Kwan',
      'Anna Luhowy'
    ])
  })

  it('sorts the untitled remainder by surname, not by given name', () => {
    const list = [
      m('Zoe Anderson', 'Strings', 'Cello'),
      m('Adam Zimmer', 'Strings', 'Cello')
    ]
    expect(names(sortMusicians(list))).toEqual(['Zoe Anderson', 'Adam Zimmer'])
  })

  it('sorts accented and hyphenated surnames in place', () => {
    const list = [
      m('Miriam Stewart-Kroeker', 'Strings', 'Cello'),
      m('Bénédicte Lauzière', 'Strings', 'Cello'),
      m('Bruce McGillivray', 'Strings', 'Cello')
    ]
    expect(names(sortMusicians(list))).toEqual([
      'Bénédicte Lauzière',
      'Bruce McGillivray',
      'Miriam Stewart-Kroeker'
    ])
  })

  it('falls back to the full name when surnames match', () => {
    const list = [
      m('Rebecca Morton', 'Strings', 'Cello'),
      m('Alan Morton', 'Strings', 'Cello')
    ]
    expect(names(sortMusicians(list))).toEqual(['Alan Morton', 'Rebecca Morton'])
  })

  it('does not mutate the input', () => {
    const list = [
      m('Zoe Anderson', 'Strings', 'Cello'),
      m('John Helmers', 'Strings', 'Cello', 'Principal', 1)
    ]
    sortMusicians(list)
    expect(names(list)).toEqual(['Zoe Anderson', 'John Helmers'])
  })
})

describe('groupMusicians', () => {
  it('orders sections by the fixed list and renders only those present', () => {
    const groups = groupMusicians([
      m('Lori Gemmell', 'Harp & Keyboard', 'Harp'),
      m('Nate Fanning', 'Brass', 'Trombone', 'Principal', 1),
      m('Anita Walsh', 'Strings', 'Second Violin', 'Principal', 1)
    ])
    expect(groups.map(g => g.section)).toEqual(['Strings', 'Brass', 'Harp & Keyboard'])
  })

  it('orders instruments by the section map, not alphabetically', () => {
    const groups = groupMusicians([
      m('Ian Whitman', 'Strings', 'Bass', 'Principal', 1),
      m('Natasha Sharko', 'Strings', 'Viola', 'Principal', 1),
      m('Anita Walsh', 'Strings', 'Second Violin', 'Principal', 1),
      m('John Helmers', 'Strings', 'Cello', 'Principal', 1),
      m('Bénédicte Lauzière', 'Strings', 'First Violin', 'Concertmaster', 1)
    ])
    expect(groups[0]!.instruments.map(i => i.instrument)).toEqual([
      'First Violin',
      'Second Violin',
      'Viola',
      'Cello',
      'Bass'
    ])
  })

  it('renders an unmapped instrument after the mapped ones rather than dropping it', () => {
    const groups = groupMusicians([
      m('A Player', 'Woodwinds', 'Piccolo'),
      m('B Player', 'Woodwinds', 'Bassoon', 'Principal', 1),
      m('C Player', 'Woodwinds', 'Flute')
    ])
    expect(groups[0]!.instruments.map(i => i.instrument)).toEqual(['Flute', 'Bassoon', 'Piccolo'])
  })

  it('renders an unmapped section after the mapped ones rather than dropping it', () => {
    const groups = groupMusicians([
      m('A Player', 'Chorus', 'Voice'),
      m('B Player', 'Strings', 'Viola')
    ])
    expect(groups.map(g => g.section)).toEqual(['Strings', 'Chorus'])
  })

  it('applies chair order within an instrument, not across a section', () => {
    const groups = groupMusicians([
      m('Melissa Scott', 'Woodwinds', 'Oboe'),
      m('Ian Hopkin', 'Woodwinds', 'Bassoon', 'Principal', 1),
      m('Lief Mosbaugh', 'Woodwinds', 'Oboe', 'Principal', 1),
      m('Kevin O\'Donnell', 'Woodwinds', 'Flute')
    ])
    expect(groups[0]!.instruments.map(i => ({ instrument: i.instrument, musicians: names(i.musicians) }))).toEqual([
      { instrument: 'Flute', musicians: ["Kevin O'Donnell"] },
      { instrument: 'Oboe', musicians: ['Lief Mosbaugh', 'Melissa Scott'] },
      { instrument: 'Bassoon', musicians: ['Ian Hopkin'] }
    ])
  })

  it('returns nothing for an empty roster', () => {
    expect(groupMusicians([])).toEqual([])
  })
})
