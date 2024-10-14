import { StringUtils } from '../stringUtils'

describe('LevenshteinDistance', () => {
  it('check Levenshtein Distance for "to climb, to lift"', () => {
    const source = 'to climb'
    const target = 'to lift'
    const testFunc = StringUtils.optimizedLevenshteinDistance.bind(
      this,
      source,
      target,
    )
    // Levenshtein distance for these two strings should be 3
    expect(testFunc(3)).toBe(true)
    expect(testFunc(2)).toBe(false)
  })

  it('check Levenshtein Distance for "tap beer, two beers"', () => {
    const source = 'tap beer'
    const target = 'two beers'
    const testFunc = StringUtils.optimizedLevenshteinDistance.bind(
      this,
      source,
      target,
    )
    // Levenshtein distance for these two strings should be 3
    expect(testFunc(3)).toBe(true)
    expect(testFunc(2)).toBe(false)
  })
})
