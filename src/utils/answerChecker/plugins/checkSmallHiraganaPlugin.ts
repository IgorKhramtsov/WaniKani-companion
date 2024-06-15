// ref: https://assets.wanikani.com/assets/v4/lib/answer_checker/plugins/check_small_hiragana-b67dcc26716ac3d68081d83fd21e14dbbb8a5e319787150a3e61aa61c9a8f938.js

import { SubjectUtils } from '@/src/types/subject'
import { CheckAnswerPlugin } from '../checkAnswerPlugin'
import { toIME } from '../toIME'

const joinWordsNicely = (words: string[]) => {
  if (words.length === 1) return words[0]
  if (words.length === 2) return words.join(' and ')
  return `${words.slice(0, words.length - 1).join(', ')} and ${words[words.length - 1]}`
}

const smallPairs: Record<string, string> = {
  ゃ: 'や',
  ゅ: 'ゆ',
  ょ: 'よ',
  ャ: 'ヤ',
  ュ: 'ユ',
  ョ: 'ヨ',
}

type Classification = 'typo' | 'mistake'

function checkforTypo(symbolA: string, symbolB: string) {
  return symbolA === smallPairs[symbolB]
}

function classify(
  responseSymbol: string,
  readingSymbol: string,
): Classification | undefined {
  if (responseSymbol === readingSymbol) {
    return undefined
  }

  if (checkforTypo(responseSymbol, readingSymbol)) {
    return 'typo'
  } else {
    return 'mistake'
  }
}

function findCorrections(response: string, reading: string) {
  const corrections = []
  for (let i = 0; i < response.length; i += 1) {
    const responseSymbol = response[i]
    const readingSymbol = reading[i]
    const classificationResult = classify(responseSymbol, readingSymbol)
    if (classificationResult === 'typo') {
      corrections.push({
        expectedChar: readingSymbol,
        expectedAnswer: reading,
      })
    } else if (classificationResult === 'mistake') {
      return false
    }
  }
  return corrections
}

function compareBigAndSmall(response: string, reading: string) {
  if (response.length === reading.length) {
    return findCorrections(response, reading)
  }
  return false
}

export const plugin: CheckAnswerPlugin = {
  shouldEvaluate: ({ taskType }) => {
    return taskType === 'reading'
  },
  evaluate: ({ response, subject }) => {
    if (!SubjectUtils.isKanji(subject) && !SubjectUtils.isVocabulary(subject)) {
      return undefined
    }

    const corrections = subject.readings
      .map(e => e.reading)
      .map(e => compareBigAndSmall(response, e))
      .filter(e => e)[0]
    if (corrections && corrections.length > 0) {
      const expectedChars = corrections.map(e => e.expectedChar)
      const expectedAnswer = corrections[0].expectedAnswer
      return {
        status: 'hint',
        message: `Watch out for the small ${joinWordsNicely(expectedChars)}. Try typing “${toIME(expectedAnswer)}” for this one.`,
      }
    }
  },
}

export default plugin
