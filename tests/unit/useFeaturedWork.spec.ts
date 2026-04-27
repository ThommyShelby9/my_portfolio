import { describe, it, expect } from 'vitest'
import { selectFeatured, sortByOrder } from '../../composables/useFeaturedWork'

const studies = [
  { slug: 'a', featured: true, order: 3 },
  { slug: 'b', featured: false, order: 1 },
  { slug: 'c', featured: true, order: 1 },
  { slug: 'd', featured: true, order: 2 },
  { slug: 'e', featured: false, order: 5 },
]

describe('sortByOrder', () => {
  it('sorts ascending by order', () => {
    const out = sortByOrder(studies)
    expect(out.map(s => s.slug)).toEqual(['b', 'c', 'd', 'a', 'e'])
  })
})

describe('selectFeatured', () => {
  it('returns only featured items, sorted by order', () => {
    const out = selectFeatured(studies)
    expect(out.map(s => s.slug)).toEqual(['c', 'd', 'a'])
  })

  it('caps to limit', () => {
    const out = selectFeatured(studies, 2)
    expect(out.map(s => s.slug)).toEqual(['c', 'd'])
  })

  it('returns empty array when none featured', () => {
    const none = [{ slug: 'x', featured: false, order: 1 }]
    expect(selectFeatured(none)).toEqual([])
  })
})
