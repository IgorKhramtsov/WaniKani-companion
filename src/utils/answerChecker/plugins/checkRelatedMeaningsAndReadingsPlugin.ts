// ref: https://assets.wanikani.com/assets/v4/lib/answer_checker/plugins/check_related_meanings_and_readings-1a8e44ff049cf573a4f8d6088e438c52fe41baa7a90ca56ddc1052e9b0a2e8fa.js

import { toHiragana } from 'wanakana'
import { CheckAnswerPlugin } from '../checkAnswerPlugin'
import { TaskType } from '@/src/types/quizTaskType'
import { SubjectType, SubjectUtils } from '@/src/types/subject'
import { EnrichedSubject } from '../types/enrichedSubject'

// TODO: we have to provide additional data for this plugin.
// The data needed is:
//  - composition items
//  - amalgamation items
// Then characters field of the current subject should be compared with the
// same field in those items and reading/meaning extracted for matched items.
// Those readings and meanings should be used to check the user response in
// case they are different from this subject's reading/meaning.
//

type RelatedSubjectsType = 'radicals' | 'kanji' | 'vocabulary'

const normalize = (input: string, taskType: TaskType) =>
  taskType === 'reading' ? toHiragana(input.trim()) : input.trim().toLowerCase()

const normalizeArray = (arr: string[], taskType: TaskType) =>
  arr.map(e => normalize(e, taskType))

const extractMeanings = (
  enrichedSubject: EnrichedSubject,
  type: RelatedSubjectsType,
) =>
  ((enrichedSubject && enrichedSubject[type]) || []).flatMap(a =>
    a.meanings.map(e => e.meaning),
  )

const extractReadings = (
  enrichedSubject: EnrichedSubject,
  type: RelatedSubjectsType,
) =>
  ((enrichedSubject && enrichedSubject[type]) || []).flatMap(e =>
    SubjectUtils.isKanji(e) || SubjectUtils.isVocabulary(e)
      ? e.readings.map(e => e.reading)
      : [],
  )

const hasMatchingAnswers = (
  correctAnswers: string[],
  taskType: TaskType,
  response: string,
) => normalizeArray(correctAnswers, taskType).indexOf(response) !== -1

const hasMatchingMeanings = (
  enrichedSubject: EnrichedSubject,
  type: RelatedSubjectsType,
  response: string,
) =>
  hasMatchingAnswers(
    extractMeanings(enrichedSubject, type),
    'meaning',
    response,
  )

const hasMatchingReadings = (
  enrichedSubject: EnrichedSubject,
  type: RelatedSubjectsType,
  response: string,
) =>
  hasMatchingAnswers(
    extractReadings(enrichedSubject, type),
    'reading',
    response,
  )

const messages: Record<
  SubjectType,
  Record<
    TaskType,
    (enrichedSubject: EnrichedSubject, response: string) => string | undefined
  >
> = {
  radical: {
    meaning: (enrichedSubject, response) =>
      hasMatchingMeanings(enrichedSubject, 'kanji', response)
        ? 'Oops, we want the radical meaning, not the kanji meaning.'
        : undefined,
    reading: () => undefined,
  },
  kanji: {
    meaning: (enrichedSubject, response) =>
      hasMatchingMeanings(enrichedSubject, 'radicals', response)
        ? 'Oops, we want the kanji meaning, not the radical meaning.'
        : hasMatchingMeanings(enrichedSubject, 'vocabulary', response)
          ? 'Oops, we want the kanji meaning, not the vocabulary meaning.'
          : undefined,
    reading: () => undefined,
  },
  vocabulary: {
    meaning: (enrichedSubject, response) =>
      hasMatchingMeanings(enrichedSubject, 'kanji', response)
        ? 'Oops, we want the vocabulary meaning, not the kanji meaning.'
        : undefined,
    reading: (enrichedSubject, reponse) =>
      hasMatchingReadings(enrichedSubject, 'kanji', reponse)
        ? 'Oops, we want the vocabulary reading, not the kanji reading.'
        : undefined,
  },
  kana_vocabulary: {
    meaning: () => undefined,
    reading: () => undefined,
  },
}

export const plugin: CheckAnswerPlugin = {
  shouldEvaluate: ({ subject: enrichedSubject }) => {
    return (
      enrichedSubject.radicals.length > 0 ||
      enrichedSubject.kanji.length > 0 ||
      enrichedSubject.vocabulary.length > 0
    )
  },
  evaluate: ({ response, subject: enrichedSubject, taskType }) => {
    const normalizedResponse = normalize(response, taskType)
    const message = messages[enrichedSubject.subject.type][taskType](
      enrichedSubject,
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
