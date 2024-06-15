// ref: https://assets.wanikani.com/assets/v4/lib/answer_checker/plugins/check_related_meanings_and_readings-1a8e44ff049cf573a4f8d6088e438c52fe41baa7a90ca56ddc1052e9b0a2e8fa.js

import { toHiragana } from 'wanakana'
import { CheckAnswerPlugin } from '../checkAnswerPlugin'
import { TaskType } from '@/src/types/quizTaskType'
import {
  SubjectType,
  SubjectTypeString,
  SubjectUtils,
} from '@/src/types/subject'

// TODO: we have to provide additional data for this plugin.
// The data needed is:
//  - composition items
//  - amalgamation items
// Then characters field of the current subject should be compared with the
// same field in those items and reading/meaning extracted for matched items.
// Those readings and meanings should be used to check the user response in
// case they are different from this subject's reading/meaning.
//

const normalize = (input: string, taskType: TaskType) =>
  taskType === 'reading' ? toHiragana(input.trim()) : input.trim().toLowerCase()

const extractMeanings = (
  data: Record<SubjectTypeString, SubjectType[]>,
  type: SubjectTypeString,
) => ((data && data[type]) || []).flatMap(a => a.meanings.map(e => e.meaning))

const extractReadings = (
  data: Record<SubjectTypeString, SubjectType[]>,
  type: SubjectTypeString,
) =>
  ((data && data[type]) || []).flatMap(e =>
    SubjectUtils.isKanji(e) || SubjectUtils.isVocabulary(e)
      ? e.readings.map(e => e.reading)
      : [],
  )

const normalizeArray = (arr: string[], taskType: TaskType) =>
  arr.map(e => normalize(e, taskType))

const hasMatchingAnswers = (
  correctAnswers: string[],
  taskType: TaskType,
  response: string,
) => normalizeArray(correctAnswers, taskType).indexOf(response) !== -1

const hasMatchingMeanings = (
  data: Record<SubjectTypeString, SubjectType[]>,
  type: SubjectTypeString,
  response: string,
) => hasMatchingAnswers(extractMeanings(data, type), 'meaning', response)

const hasMatchingReadings = (
  data: Record<SubjectTypeString, SubjectType[]>,
  type: SubjectTypeString,
  response: string,
) => hasMatchingAnswers(extractReadings(data, type), 'reading', response)

const messages: Record<
  SubjectTypeString,
  Record<
    TaskType,
    (
      data: Record<SubjectTypeString, SubjectType[]>,
      type: SubjectTypeString,
    ) => string | undefined
  >
> = {
  radical: {
    meaning: (a, n) =>
      hasMatchingMeanings(a, 'kanji', n)
        ? 'Oops, we want the radical meaning, not the kanji meaning.'
        : undefined,
    reading: () => undefined,
  },
  kanji: {
    meaning: (a, n) =>
      hasMatchingMeanings(a, 'radicals', n)
        ? 'Oops, we want the kanji meaning, not the radical meaning.'
        : hasMatchingMeanings(a, 'vocabulary', n)
          ? 'Oops, we want the kanji meaning, not the vocabulary meaning.'
          : undefined,
    reading: () => undefined,
  },
  vocabulary: {
    meaning: (a, n) =>
      hasMatchingMeanings(a, 'kanji', n)
        ? 'Oops, we want the vocabulary meaning, not the kanji meaning.'
        : undefined,
    reading: (a, n) =>
      hasMatchingReadings(a, 'kanji', n)
        ? 'Oops, we want the vocabulary reading, not the kanji reading.'
        : undefined,
  },
  kana_vocabulary: {
    meaning: (a, n) => undefined,
    reading: (a, n) => undefined,
  },
}

export const plugin: CheckAnswerPlugin = {
  shouldEvaluate: ({ checkResult, taskType, subject }) => {
    // TODO: populate radicals, kanji and vocabulary with the data
    return (
      this.hasPopulatedArray('radicals') ||
      this.hasPopulatedArray('kanji') ||
      this.hasPopulatedArray('vocabulary')
    )
  },
  evaluate: ({ response, subject, taskType }) => {
    const normalizedResponse = normalize(response, taskType)
    const message = messages[subject.type][taskType](
      subject,
      normalizedResponse,
    )
    if (message) {
      return {
        status: 'hint',
        message: message,
      }
    }
  },
}

export default plugin
