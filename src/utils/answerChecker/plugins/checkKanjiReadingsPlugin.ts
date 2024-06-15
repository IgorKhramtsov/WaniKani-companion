// ref: https://assets.wanikani.com/assets/v4/lib/answer_checker/plugins/check_kanji_readings-949ea105a90acc53f21cef2e23e52646be15f87715b163b55940f4190fa60802.js

import { SubjectUtils } from '@/src/types/subject'
import { CheckAnswerPlugin } from '../checkAnswerPlugin'
import { Kanji } from '@/src/types/kanji'
import { toNiceEmphasis } from '@/src/types/reading'

const answeredAlternateReading = (subject: Kanji, response: string) => {
  const primaryReading = SubjectUtils.getPrimaryReadingType(subject)
  const alternativeReadings = subject.readings.filter(
    r => r.reading !== primaryReading,
  )
  return alternativeReadings.some(r => r.reading === response)
}

export const plugin: CheckAnswerPlugin = {
  shouldEvaluate: ({ checkResult, taskType, subject }) => {
    return (
      !checkResult.passed &&
      taskType === 'reading' &&
      SubjectUtils.isKanji(subject)
    )
  },
  evaluate: ({ response, subject }) => {
    if (!SubjectUtils.isKanji(subject)) return undefined

    if (answeredAlternateReading(subject, response)) {
      const primaryReading = SubjectUtils.getPrimaryReadingType(subject)
      if (!primaryReading) return undefined

      return {
        status: 'hint',
        message: `WaniKani is looking for the ${toNiceEmphasis(primaryReading)} reading.`,
      }
    }
  },
}

export default plugin
