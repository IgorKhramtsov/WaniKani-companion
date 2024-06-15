// ref: https://assets.wanikani.com/assets/v4/lib/answer_checker/plugins/check_kanji_does_not_start_with_to-da19fa7b9fea08bee8697eaee6afda62ebca3a2b5e7ccd522d6f056a0406edf2.js

import { SubjectUtils } from '@/src/types/subject'
import { CheckAnswerPlugin } from '../checkAnswerPlugin'
import { Kanji } from '@/src/types/kanji'

const hasMatchedMeaning = (response: string, subject: Kanji) => {
  const t = response.substring(3).toLowerCase()
  return subject.meanings.some(e => t === e.meaning.toLowerCase())
}

export const plugin: CheckAnswerPlugin = {
  shouldEvaluate: ({ checkResult, taskType, subject, response }) => {
    return (
      !checkResult.passed &&
      taskType === 'meaning' &&
      SubjectUtils.isKanji(subject.subject) &&
      response.startsWith('to ')
    )
  },
  evaluate: ({ response, subject: enrichedSubject }) => {
    const { subject } = enrichedSubject
    if (!SubjectUtils.isKanji(subject)) return undefined

    if (hasMatchedMeaning(response, subject)) {
      return {
        status: 'hint',
        message: 'This is a kanji, so it doesn\u2019t start with "to".',
      }
    }
  },
}

export default plugin
