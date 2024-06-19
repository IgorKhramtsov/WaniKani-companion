import { Vocabulary } from '@/src/types/vocabulary'
import { EnrichedSubject } from '../../types/enrichedSubject'
import { CheckAnswerPluginInput } from '../../checkAnswerPlugin'
import plugin from '../checkLongDashPlugin'

describe('CheckAnswerPlugin', () => {
  const subjectVocab: EnrichedSubject<Vocabulary> = {
    subject: {
      type: 'vocabulary',
      readings: [{ reading: 'らーめん', accepted_answer: true }],
    } as Vocabulary,
    radicals: [],
    kanji: [],
    vocabulary: [],
  }

  const createCheckAnswerInput = (
    response: string,
    taskType: string,
    subject: EnrichedSubject<any>,
  ): CheckAnswerPluginInput => ({
    response,
    taskType: taskType as any,
    checkResult: { passed: false } as any,
    subject,
    userSynonyms: [],
  })

  test('shouldEvaluate should return true for reading tasks', () => {
    const response = 'らあめん'
    expect(
      plugin.shouldEvaluate(
        createCheckAnswerInput(response, 'reading', subjectVocab),
      ),
    ).toBe(true)
  })

  test('shouldEvaluate should return false for non-reading tasks', () => {
    const response = 'らあめん'
    expect(
      plugin.shouldEvaluate(
        createCheckAnswerInput(response, 'meaning', subjectVocab),
      ),
    ).toBe(false)
  })

  test('evaluate should return a hint for vocabulary  readings with long dash', () => {
    const response = 'らあめん'
    const result = plugin.evaluate(
      createCheckAnswerInput(response, 'reading', subjectVocab),
    )
    expect(result).toMatchObject({
      status: 'hint',
      message: 'Try typing “ra-menn” to get that long ー.',
    })
  })

  test('evaluate should return a hint for vocabulary reading with long dash', () => {
    const response = 'らあめん'
    const result = plugin.evaluate(
      createCheckAnswerInput(response, 'reading', subjectVocab),
    )
    expect(result).toMatchObject({
      status: 'hint',
      message: 'Try typing “ra-menn” to get that long ー.',
    })
  })

  test('evaluate should return a hint for vocabulary reading with long dash and a typo in user response', () => {
    const subjectVocabCoffee: EnrichedSubject<Vocabulary> = {
      subject: {
        type: 'vocabulary',
        readings: [{ reading: 'かんこーひー', accepted_answer: true }],
      } as Vocabulary,
      radicals: [],
      kanji: [],
      vocabulary: [],
    }
    const response = 'かんこうひい'
    const result = plugin.evaluate(
      createCheckAnswerInput(response, 'reading', subjectVocabCoffee),
    )
    expect(result).toMatchObject({
      status: 'hint',
      message: 'Try typing “kannko-hi-” to get that long ー.',
    })
  })

  test('evaluate should return undefined for non-kanji and non-vocabulary subjects', () => {
    const subjectNonKanjiVocab: EnrichedSubject<any> = {
      subject: {
        type: 'radical',
        readings: [],
        meanings: [],
      },
      radicals: [],
      kanji: [],
      vocabulary: [],
    }
    const response = 'えい'
    const result = plugin.evaluate(
      createCheckAnswerInput(response, 'reading', subjectNonKanjiVocab),
    )
    expect(result).toBeUndefined()
  })

  test('evaluate should return undefined for correct primary reading without long dash', () => {
    const subjectWithoutLongDash: EnrichedSubject<any> = {
      subject: {
        type: 'vocabulary',
        readings: [{ reading: 'うえ', accepted_answer: true }],
        meanings: [],
      },
      radicals: [],
      kanji: [],
      vocabulary: [],
    }
    const response = 'うえ'
    const result = plugin.evaluate(
      createCheckAnswerInput(response, 'reading', subjectWithoutLongDash),
    )
    expect(result).toBeUndefined()
  })
})
