// ref: https://assets.wanikani.com/assets/v4/lib/answer_checker/plugins/check_transliterated-8ecc5a820705ce4d7f37f58cac1d196b54af0f92c36946134c9ed78423c32f71.js

import { toHiragana } from 'wanakana'
import { CheckAnswerPlugin } from '../checkAnswerPlugin'
import { TaskType } from '@/src/types/quizTaskType'
import { SubjectUtils } from '@/src/types/subject'

const isIMEEquivalent = (a: string, b: string) => {
  return toHiragana(a) === toHiragana(addMissingNs(b), { IMEMode: true })
}

const addMissingNs = (e: string) =>
  e.replaceAll(/[^n]n$/g, e => e.replace('n', 'nn'))

const hasMatchedReading = (
  readings: string[],
  response: string,
  taskType: TaskType,
) => {
  return (
    taskType === 'meaning' && readings.some(e => isIMEEquivalent(e, response))
  )
}

const hasMatchedMeaning = (
  meanings: string[],
  inputChars: string,
  taskType: TaskType,
) => {
  const normalized = inputChars.toLowerCase()
  return (
    taskType === 'reading' && meanings.some(n => normalized === n.toLowerCase())
  )
}

export const plugin: CheckAnswerPlugin = {
  shouldEvaluate: ({ checkResult }) => {
    return !checkResult.passed
  },
  evaluate: ({
    response,
    subject: enrichedSubject,
    taskType,
    userSynonyms,
  }) => {
    const { subject } = enrichedSubject

    if (
      (SubjectUtils.isVocabulary(subject) || SubjectUtils.isKanji(subject)) &&
      hasMatchedReading(
        subject.readings.map(e => e.reading),
        response,
        taskType,
      )
    ) {
      return {
        status: 'hint',
        message: 'Oops, we want the meaning, not the reading.',
      }
    }
    if (
      hasMatchedMeaning(
        subject.meanings.map(e => e.meaning).concat(userSynonyms),
        response,
        taskType,
      )
    ) {
      return {
        status: 'hint',
        message: 'Oops, we want the reading, not the meaning.',
      }
    }
  },
}

export default plugin
