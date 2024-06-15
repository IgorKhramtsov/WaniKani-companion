import { TaskType } from '@/src/types/quizTaskType'
import { Subject, SubjectUtils } from '@/src/types/subject'
import { StringUtils } from '../stringUtils'

const punctuationRange = '\u3000-\u303f'
const fullAndHalfWidthRange = '\uff00-\uff9f'
const hiraganaRange = '\u3040-\u309f'
const katakanaRange = '\u30a0-\u30ff'
const nonKanaPattern = new RegExp(`[^${hiraganaRange}${katakanaRange}]`)
const kanaPatternExtended = new RegExp(
  `[${punctuationRange}${hiraganaRange}${katakanaRange}${fullAndHalfWidthRange}]`,
)

export type CheckAnswerResult = {
  passed: boolean
  accurate: boolean
  multipleAnswers: boolean
}

const isKanaPresent = (input: string) => kanaPatternExtended.test(input)

const isNonKanaPresent = (input: string) => {
  // there might be an 'n' at the end that is part of the english to kana
  // transliteration, so we remove it
  const a = input[input.length - 1] === 'n' ? input.slice(0, -1) : input
  return nonKanaPattern.test(a)
}

export const normalizeString = (response: string) =>
  response
    .trim()
    .toLowerCase()
    .replace(/-/g, ' ')
    .replace(/\.|,|'|\u2019|\/|:/g, '')

export const questionTypeAndResponseMatch = (
  taskType: TaskType,
  response: string,
) =>
  (taskType === 'reading' && !isNonKanaPresent(response)) ||
  (taskType === 'meaning' && !isKanaPresent(response))

const filterDigits = (input: string) => {
  const match = input.match(/\d+/g)
  return match ? match.sort() : []
}

const hasDigits = (input: string) => {
  return filterDigits(input).length > 0
}

const digitsMatch = (a: string, b: string) => {
  return filterDigits(a).toString() === filterDigits(b).toString()
}

export const checkReading = (
  input: string,
  subject: Subject,
): CheckAnswerResult => {
  const correctAnswers = readingAnswerList(subject)
  const hasMatch = correctAnswers.some(e => e === input)
  return {
    passed: hasMatch,
    accurate: hasMatch,
    multipleAnswers: correctAnswers.length > 1,
  }
}

export const checkMeaning = (
  input: string,
  subject: Subject,
  userSynonyms: string[],
): CheckAnswerResult => {
  const meanings = getFullMeaningAnswerList(subject, input, userSynonyms)
  const multipleAnswers = subject.meanings.length > 1
  if (isBlacklisted(subject, input))
    return { passed: false, accurate: false, multipleAnswers }

  const comparisonResult = compareInputWithMeanings(input, meanings)
  return {
    passed: comparisonResult.result !== 'not',
    accurate: comparisonResult.result === 'exact',
    multipleAnswers,
  }
}

const readingAnswerList = (subject: Subject) => {
  if (!SubjectUtils.isKanji(subject) && !SubjectUtils.isVocabulary(subject)) {
    return []
  }
  return subject.readings.filter(e => e.accepted_answer).map(e => e.reading)
}

const getFullMeaningAnswerList = (
  subject: Subject,
  input: string,
  userSynonyms: string[],
) => {
  const auxilaryMeanings = subject.auxiliary_meanings
    .filter(e => e.type === 'whitelist')
    .map(e => e.meaning)
  let allMeanings = subject.meanings
    .map(e => e.meaning)
    .concat(userSynonyms)
    .concat(auxilaryMeanings)
    .map(e => normalizeString(e))
  const meaningsWithDigits = allMeanings.filter(e => hasDigits(e))

  // If input has digits, only return meanings with digits
  if (hasDigits(input) && meaningsWithDigits.length > 0) {
    return meaningsWithDigits
  }
  return allMeanings
}

function isBlacklisted(subject: Subject, input: string) {
  return subject.auxiliary_meanings.some(
    item =>
      item.type === 'blacklist' && input === normalizeString(item.meaning),
  )
}

const compareInputWithMeanings = (
  input: string,
  correctAnswers: string[],
): StringUtils.ComparisonResult => {
  if (
    hasDigits(input) &&
    correctAnswers.some(e => hasDigits(e)) &&
    !correctAnswers.some(e => digitsMatch(e, input))
  ) {
    // If numbers are present and don't match - this answer is wrong
    return {
      result: 'not',
      match: undefined,
    }
  }
  const tolerance = getLevenshteinTolerance(input)
  return StringUtils.compareStringWithArrayWithThreshold(
    input,
    correctAnswers,
    tolerance,
  )
}

const getLevenshteinToleranceByLength = (input: string) =>
  2 + 1 * Math.floor(input.length / 7)

const getLevenshteinTolerance = (input: string) => {
  const predefinedTolerance = levenshteinTolerances[input.length]
  return predefinedTolerance ?? getLevenshteinToleranceByLength(input)
}

const levenshteinTolerances: Record<number, number> = {
  0: 0,
  1: 0,
  2: 0,
  3: 0,
  4: 1,
  5: 1,
  6: 2,
  7: 2,
}
