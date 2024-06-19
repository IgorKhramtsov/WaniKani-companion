import { Kanji } from '@/src/types/kanji'
import { EnrichedSubject } from '../../types/enrichedSubject'
import { CheckAnswerPluginInput } from '../../checkAnswerPlugin'
import { Vocabulary } from '@/src/types/vocabulary'
import plugin from '../checkSmallHiraganaPlugin'

describe('checkSmallHiraganaPlugin', () => {
  const createCheckAnswerInput = (
    response: string,
    taskType: string,
    enrichedSubject: EnrichedSubject<any>,
  ): CheckAnswerPluginInput => ({
    response,
    taskType: taskType as any,
    checkResult: { passed: false } as any,
    subject: enrichedSubject,
    userSynonyms: [],
  })

  const kanjiSubject: EnrichedSubject<Kanji> = {
    subject: {
      type: 'kanji',
      readings: [{ reading: 'きゃく' }],
    } as Kanji,
    radicals: [],
    kanji: [],
    vocabulary: [],
  }

  const vocabSubject: EnrichedSubject<Vocabulary> = {
    subject: {
      type: 'vocabulary',
      readings: [{ reading: 'りゅうがく' }],
    } as Vocabulary,
    radicals: [],
    kanji: [],
    vocabulary: [],
  }

  test('shouldEvaluate should return true for reading tasks', () => {
    const response = 'きやく'
    expect(
      plugin.shouldEvaluate(
        createCheckAnswerInput(response, 'reading', kanjiSubject),
      ),
    ).toBe(true)
  })

  test('shouldEvaluate should return false for non-reading tasks', () => {
    const response = 'guest'
    expect(
      plugin.shouldEvaluate(
        createCheckAnswerInput(response, 'meaning', kanjiSubject),
      ),
    ).toBe(false)
  })

  test('evaluate should return hint for kanji reading with small kana mistake', () => {
    const response = 'きやく'
    const result = plugin.evaluate(
      createCheckAnswerInput(response, 'reading', kanjiSubject),
    )
    expect(result).toMatchObject({
      status: 'hint',
      message: 'Watch out for the small ゃ. Try typing “kyaku” for this one.',
    })
  })

  test('evaluate should return hint for vocabulary reading with small kana mistake', () => {
    const response = 'りゆうがく'
    const result = plugin.evaluate(
      createCheckAnswerInput(response, 'reading', vocabSubject),
    )
    expect(result).toMatchObject({
      status: 'hint',
      message:
        'Watch out for the small ゅ. Try typing “ryuugaku” for this one.',
    })
  })

  test('evaluate should return undefined for correct kanji reading', () => {
    const response = 'きゃく'
    const result = plugin.evaluate(
      createCheckAnswerInput(response, 'reading', kanjiSubject),
    )
    expect(result).toBeUndefined()
  })

  test('evaluate should return undefined for correct vocabulary reading', () => {
    const response = 'りゅうがく'
    const result = plugin.evaluate(
      createCheckAnswerInput(response, 'reading', vocabSubject),
    )
    expect(result).toBeUndefined()
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
    const response = 'あい'
    const result = plugin.evaluate(
      createCheckAnswerInput(response, 'reading', subjectNonKanjiVocab),
    )
    expect(result).toBeUndefined()
  })
})
