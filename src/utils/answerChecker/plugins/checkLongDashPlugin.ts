// ref: https://assets.wanikani.com/assets/v4/lib/answer_checker/plugins/check_long_dash-d38feda3c449537cd55a84bf888c9bf153cdda10837fa22b36a30830f2253128.js

import { SubjectUtils } from '@/src/types/subject'
import { CheckAnswerPlugin } from '../checkAnswerPlugin'
import { toHiragana as wanakanaToHiragana, toRomaji } from 'wanakana'
import { Vocabulary } from '@/src/types/vocabulary'
import { Kanji } from '@/src/types/kanji'
import { toIME } from '../toIME'

const soundAlikes: Record<string, string> = {
  お: 'う',
  う: 'お',
  え: 'い',
}

const toHiragana = (input: string) =>
  wanakanaToHiragana(input, { convertLongVowelMark: false })

const getEndingVowel = (input: string) => {
  const romaji = toRomaji(input)
  return romaji[romaji.length - 1]
}

const matchedLongDashReading = (
  subject: Kanji | Vocabulary,
  userInput: string,
) => {
  return subject.readings.find(
    e =>
      containsLongDash(e.reading) &&
      reponseMatchesConvertedReading(e.reading, userInput),
  )
}

const containsLongDash = (e: string) => {
  return e.indexOf('ー') !== -1
}

const reponseMatchesConvertedReading = (reading: string, response: string) => {
  const convertedReading = convertDashesToVowels(reading)
  const hiragana = toHiragana(response)
  return vowelsMatch(convertedReading, hiragana, reading)
}

const convertDashesToVowels = (input: string) => {
  let result = ''
  for (let i = 0; i < input.length; i++) {
    if (input[i] === 'ー') {
      result += toHiragana(getEndingVowel(input[i - 1]))
    } else {
      result += toHiragana(input[i])
    }
  }
  return result
}

const vowelsMatch = (
  convertedReading: string,
  hiragana: string,
  reading: string,
) => {
  return (
    convertedReading.length === hiragana.length &&
    convertedReading
      .split('')
      .every((symbol, index) =>
        charactersMatchWithTypos(hiragana, reading, symbol, index),
      )
  )
}

const charactersMatchWithTypos = (
  hiragana: string,
  reading: string,
  symbol: string,
  index: number,
) => {
  if (symbol === hiragana[index]) return true

  const soundAlikeMatch = hiragana[index] === soundAlikes[symbol]
  const isLongDash = reading[index] === 'ー'
  const hasSoundAlikeMatchForReading =
    Object.keys(soundAlikes).indexOf(reading[index - 1]) !== -1
  return soundAlikeMatch && isLongDash && !hasSoundAlikeMatchForReading
}

export const plugin: CheckAnswerPlugin = {
  shouldEvaluate: ({ taskType }) => {
    return taskType === 'reading'
  },
  evaluate: ({ response: userInput, subject: enrichedSubject }) => {
    const { subject } = enrichedSubject
    if (!SubjectUtils.isKanji(subject) && !SubjectUtils.isVocabulary(subject))
      return undefined

    const reading = matchedLongDashReading(subject, userInput)
    if (reading) {
      return {
        status: 'hint',
        message: `Try typing “${toIME(reading.reading)}” to get that long ー.`,
      }
    }
  },
}

export default plugin
