// ref: https://assets.wanikani.com/assets/v4/lib/answer_checker/plugins/check_kanji-2744a0ad689801d26af6159b2f1df64e864e73ffd15743c18564b2f8f5eb664c.js

import { CheckAnswerPlugin } from '../checkAnswerPlugin'

export const plugin: CheckAnswerPlugin = {
  shouldEvaluate: ({ subject, response }) => {
    return subject.characters === response
  },
  evaluate: () => {
    return {
      status: 'hint',
      message: undefined,
    }
  },
}

export default plugin
