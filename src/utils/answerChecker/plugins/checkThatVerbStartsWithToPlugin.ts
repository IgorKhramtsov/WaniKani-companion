// ref: https://assets.wanikani.com/assets/v4/lib/answer_checker/plugins/check_that_verb_starts_with_to-6089ce6ae4ff6cee559d2e3251e379be9005baa6dd43b94d89fcc490f92904f6.js

import { SubjectType } from '@/src/types/subject'
import { stripOkurigana } from 'wanakana'
import { CheckAnswerPlugin } from '../checkAnswerPlugin'

const findMatchedMeaning = (subject: SubjectType, response: string) => {
  // TODO: use levenshtein distance to find the closest match
  return subject.meanings
    .map(e => e.meaning)
    .find(e => {
      const normalizedE = e.toLowerCase()
      return (
        normalizedE.startsWith('to ') &&
        normalizedE.replace('to ', '') === response.toLowerCase()
      )
    })
}

export const plugin: CheckAnswerPlugin = {
  shouldEvaluate: ({ subject, response, checkResult, taskType }) => {
    return (
      !checkResult.passed &&
      taskType === 'meaning' &&
      subject.subject.meanings &&
      subject.subject.meanings.some(t =>
        t.meaning.toLowerCase().startsWith('to '),
      ) &&
      !response.toLowerCase().startsWith('to ')
    )
  },
  evaluate: ({ response, subject: enrichedSubject }) => {
    const { subject } = enrichedSubject
    const matchedMeaning = findMatchedMeaning(subject, response)

    if (matchedMeaning && subject.characters) {
      const characters =
        subject.characters.replace(stripOkurigana(subject.characters), '') ||
        subject.characters
      return {
        status: 'hint',
        message: `Almost! It ends in ${characters[characters.length - 1]}, so it’s a verb. Please type “${matchedMeaning}”.`,
      }
    }
  },
}

export default plugin
