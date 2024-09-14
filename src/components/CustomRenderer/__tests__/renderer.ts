import { parseStringToElements } from '../Index'

describe('parseStringToElements', () => {
  it('should parse plain text correctly, splitting by words', () => {
    const input = 'This is plain text'
    const result = parseStringToElements(input)
    expect(result).toEqual([
      { type: 'text', content: 'This ', metaTags: [] },
      { type: 'text', content: 'is ', metaTags: [] },
      { type: 'text', content: 'plain ', metaTags: [] },
      { type: 'text', content: 'text', metaTags: [] },
    ])
  })

  it('should parse text with a single tag correctly', () => {
    const input = 'This is <vocabulary>vocabulary</vocabulary> text'
    const result = parseStringToElements(input)
    expect(result).toEqual([
      { type: 'text', content: 'This ', metaTags: [] },
      { type: 'text', content: 'is ', metaTags: [] },
      { type: 'vocabulary', content: 'vocabulary', metaTags: [] },
      { type: 'text', content: ' ', metaTags: [] },
      { type: 'text', content: 'text', metaTags: [] },
    ])
  })

  it('should parse text with multiple tags correctly', () => {
    const input = '<kanji>漢字</kanji> and <radical>部首</radical>'
    const result = parseStringToElements(input)
    expect(result).toEqual([
      { type: 'kanji', content: '漢字', metaTags: [] },
      { type: 'text', content: ' ', metaTags: [] },
      { type: 'text', content: 'and ', metaTags: [] },
      { type: 'radical', content: '部首', metaTags: [] },
    ])
  })

  it('should handle line breaks correctly', () => {
    const input = 'Line 1\r\nLine 2\nLine 3'
    const result = parseStringToElements(input)
    expect(result).toEqual([
      { type: 'text', content: 'Line ', metaTags: [] },
      { type: 'text', content: '1\n', metaTags: [] },
      { type: 'text', content: 'Line ', metaTags: [] },
      { type: 'text', content: '2\n', metaTags: [] },
      { type: 'text', content: 'Line ', metaTags: [] },
      { type: 'text', content: '3', metaTags: [] },
    ])
  })

  it('should handle mixed content correctly', () => {
    const input =
      'Start <kanji><ja>漢字</ja></kanji> <radical><ja>部首</ja></radical>\nNew line'
    const result = parseStringToElements(input)
    expect(result).toEqual([
      { type: 'text', content: 'Start ', metaTags: [] },
      { type: 'kanji', content: '漢字', metaTags: ['ja'] },
      { type: 'text', content: ' ', metaTags: [] },
      { type: 'radical', content: '部首', metaTags: ['ja'] },
      { type: 'text', content: '\n', metaTags: [] },
      { type: 'text', content: 'New ', metaTags: [] },
      { type: 'text', content: 'line', metaTags: [] },
    ])
  })

  it('should handle empty content correctly', () => {
    const input = ''
    const result = parseStringToElements(input)
    expect(result).toEqual([])
  })

  it('should handle consecutive spaces as expected', () => {
    const input = 'Word1  Word2   Word3'
    const result = parseStringToElements(input)
    expect(result).toEqual([
      { type: 'text', content: 'Word1 ', metaTags: [] },
      { type: 'text', content: ' ', metaTags: [] },
      { type: 'text', content: 'Word2 ', metaTags: [] },
      { type: 'text', content: ' ', metaTags: [] },
      { type: 'text', content: ' ', metaTags: [] },
      { type: 'text', content: 'Word3', metaTags: [] },
    ])
  })
})
