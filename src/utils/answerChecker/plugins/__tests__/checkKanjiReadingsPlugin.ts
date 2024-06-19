import { Kanji } from '@/src/types/kanji'
import { EnrichedSubject } from '../../types/enrichedSubject'
import { CheckAnswerPluginInput } from '../../checkAnswerPlugin'
import { Vocabulary } from '@/src/types/vocabulary'
import plugin from '../checkKanjiReadingsPlugin'

describe('checkKanjiReadingsPlugin', () => {
  const checkResultFailed = { passed: false }
  const checkResultPassed = { passed: true }

  const subjectKanji: EnrichedSubject<Kanji> = {
    subject: {
      type: 'kanji',
      readings: [
        {
          reading: 'にん',
          primary: true,
          type: 'onyomi',
        },
        {
          reading: 'じん',
          primary: true,
          type: 'onyomi',
        },
        {
          reading: 'ひと',
          primary: false,
          type: 'kunyomi',
        },
      ],
    } as Kanji,
    radicals: [],
    kanji: [],
    vocabulary: [],
  }

  const createCheckAnswerInput = (
    response: string,
    taskType: string,
    checkResult: any,
  ): CheckAnswerPluginInput => ({
    response,
    taskType: taskType as any,
    checkResult,
    subject: subjectKanji,
    userSynonyms: [],
  })

  test('shouldEvaluate should return true for failed reading tasks with Kanji', () => {
    const response = 'ひと'
    expect(
      plugin.shouldEvaluate(
        createCheckAnswerInput(response, 'reading', checkResultFailed),
      ),
    ).toBe(true)
  })

  test('shouldEvaluate should return false for passed check results', () => {
    const response = 'にん'
    expect(
      plugin.shouldEvaluate(
        createCheckAnswerInput(response, 'reading', checkResultPassed),
      ),
    ).toBe(false)
  })

  test('shouldEvaluate should return false for non-reading tasks', () => {
    const response = 'にん'
    expect(
      plugin.shouldEvaluate(
        createCheckAnswerInput(response, 'meaning', checkResultFailed),
      ),
    ).toBe(false)
  })

  test('evaluate should return a hint for alternate readings', () => {
    const response = 'ひと'
    const result = plugin.evaluate(
      createCheckAnswerInput(response, 'reading', checkResultFailed),
    )
    expect(result).toMatchObject({
      status: 'hint',
      message: 'WaniKani is looking for the on’yomi reading.',
    })
  })

  test('evaluate should return undefined for primary readings', () => {
    const response = 'にん'
    const result = plugin.evaluate(
      createCheckAnswerInput(response, 'reading', checkResultFailed),
    )
    expect(result).toBeUndefined()
  })

  test('evaluate should return undefined for non-Kanji subjects', () => {
    const subjectNonKanji: EnrichedSubject<Vocabulary> = {
      subject: {
        type: 'vocabulary',
        readings: [{ reading: 'たべる' }],
      } as Vocabulary,
      radicals: [],
      kanji: [],
      vocabulary: [],
    }
    const response = 'たべる'
    const result = plugin.evaluate({
      ...createCheckAnswerInput(response, 'reading', checkResultFailed),
      subject: subjectNonKanji,
    })
    expect(result).toBeUndefined()
  })
})
