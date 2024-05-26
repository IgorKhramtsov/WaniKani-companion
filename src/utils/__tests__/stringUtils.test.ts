import { StringUtils } from '../stringUtils'

const matchOne = (a: string, b: string) =>
  StringUtils.compareStringWithArrayWithThresholdEnsuringNumbers(a, [b], 1)

describe('StringUtils', () => {
  it('matches string with one word with threshold', () => {
    const result = matchOne('word', 'word')
    expect(result.result).toEqual('equal')
  })
  it('matches string with a number and a word with threshold (equal)', () => {
    const result = matchOne('1 day', '1 day')
    expect(result.result).toEqual('equal')
  })
  it('matches string with a number and a word with threshold (without space)', () => {
    const result = matchOne('1day', '1 day')
    expect(result.result).toEqual('almost')
  })
  it('does not match string with wrong number and a word with threshold (without space)', () => {
    const result = matchOne('2 day', '1 day')
    expect(result.result).toEqual('not')
  })
  it('matches string with a number and a word with threshold (without space (case insensitive))', () => {
    const result = matchOne('3things', '3 Things')
    expect(result.result).toEqual('almost')
  })
})
