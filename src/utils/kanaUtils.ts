const punctuationRange = '\u3000-\u303f'
const fullAndHalfWidthRange = '\uff00-\uff9f'
const hiraganaRange = '\u3040-\u309f'
const katakanaRange = '\u30a0-\u30ff'
const nonKanaPattern = new RegExp(`[^${hiraganaRange}${katakanaRange}]`)
const kanaPatternExtended = new RegExp(
  `[${punctuationRange}${hiraganaRange}${katakanaRange}${fullAndHalfWidthRange}]`,
)
const katakanaPattern = new RegExp(`[${katakanaRange}]`)

export const isKatakanaPresent = (input: string) => katakanaPattern.test(input)
export const isKanaPresent = (input: string) => kanaPatternExtended.test(input)
export const isNonKanaPresent = (input: string) => {
  // there might be an 'n' at the end that is part of the english to kana
  // transliteration, so we remove it
  const a = input[input.length - 1] === 'n' ? input.slice(0, -1) : input
  return nonKanaPattern.test(a)
}
