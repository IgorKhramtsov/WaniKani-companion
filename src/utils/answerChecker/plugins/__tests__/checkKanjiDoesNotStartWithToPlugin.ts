import { Kanji } from '@/src/types/kanji'
import { EnrichedSubject } from '../../types/enrichedSubject'
import { CheckAnswerPluginInput } from '../../checkAnswerPlugin'
import { Vocabulary } from '@/src/types/vocabulary'
import plugin from '../checkKanjiDoesNotStartWithToPlugin'

describe('checkKanjiDoesNotStartWithToPlugin', () => {
  const checkResultPassed = { passed: true }
  const checkResultFailed = { passed: false }

  const subjectKanji: EnrichedSubject<Kanji> = {
    subject: {
      type: 'kanji',
      meanings: [{ meaning: 'eat' }, { meaning: 'consume' }],
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

  test('shouldEvaluate should return true for meaning tasks with Kanji starting with "to "', () => {
    expect(
      plugin.shouldEvaluate(
        createCheckAnswerInput('to eat', 'meaning', checkResultFailed),
      ),
    ).toBe(true)
  })

  test('shouldEvaluate should return false for passed check results', () => {
    expect(
      plugin.shouldEvaluate(
        createCheckAnswerInput('to eat', 'meaning', checkResultPassed),
      ),
    ).toBe(false)
  })

  test('shouldEvaluate should return false for non-meaning tasks', () => {
    expect(
      plugin.shouldEvaluate(
        createCheckAnswerInput('to eat', 'reading', checkResultFailed),
      ),
    ).toBe(false)
  })

  test('shouldEvaluate should return false for responses not starting with "to "', () => {
    expect(
      plugin.shouldEvaluate(
        createCheckAnswerInput('eat', 'meaning', checkResultFailed),
      ),
    ).toBe(false)
  })

  test('evaluate should return a hint for responses starting with "to " that match a meaning', () => {
    const response = 'to eat'
    const result = plugin.evaluate(
      createCheckAnswerInput(response, 'meaning', checkResultFailed),
    )
    expect(result).toMatchObject({
      status: 'hint',
      message: 'This is a kanji, so it doesn’t start with "to".',
    })
  })

  test('evaluate should return undefined for responses that do not match any meaning', () => {
    const response = 'to sleep'
    const result = plugin.evaluate(
      createCheckAnswerInput(response, 'meaning', checkResultFailed),
    )
    expect(result).toBeUndefined()
  })

  test('evaluate should return undefined for non-Kanji subjects', () => {
    const subjectNonKanji: EnrichedSubject<Vocabulary> = {
      subject: {
        type: 'vocabulary',
        meanings: [{ meaning: 'to eat' }],
      } as Vocabulary,
      radicals: [],
      kanji: [],
      vocabulary: [],
    }
    const response = 'to eat'
    const result = plugin.evaluate({
      ...createCheckAnswerInput(response, 'meaning', checkResultFailed),
      subject: subjectNonKanji,
    })
    expect(result).toBeUndefined()
  })
})
