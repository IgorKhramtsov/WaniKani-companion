import { TaskType } from '@/src/types/quizTaskType'
import { EnrichedSubject } from '../../types/enrichedSubject'
import { CheckAnswerPluginInput } from '../../checkAnswerPlugin'
import { Radical } from '@/src/types/radical'
import { Kanji } from '@/src/types/kanji'
import { Vocabulary } from '@/src/types/vocabulary'
import plugin from '../checkRelatedMeaningsAndReadingsPlugin'

describe('checkRelatedMeaningsAndReadingsPlugin', () => {
  const createCheckAnswerInput = (
    response: string,
    taskType: TaskType,
    enrichedSubject: EnrichedSubject,
  ): CheckAnswerPluginInput => ({
    response,
    taskType,
    checkResult: { passed: false } as any,
    subject: enrichedSubject,
    userSynonyms: [],
  })

  const kanjiSubject = {
    type: 'kanji',
    meanings: [{ meaning: 'eat' }],
    readings: [{ reading: 'しょく' }],
  } as Kanji

  const vocabSubject = {
    type: 'vocabulary',
    meanings: [{ meaning: 'to eat' }],
    readings: [{ reading: 'たべる' }],
  } as Vocabulary

  const kanjiSubjectEnr: EnrichedSubject<Kanji> = {
    subject: kanjiSubject,
    radicals: [],
    kanji: [],
    vocabulary: [vocabSubject],
  }

  const vocabSubjectEnr: EnrichedSubject<Vocabulary> = {
    subject: vocabSubject,
    radicals: [],
    kanji: [kanjiSubject],
    vocabulary: [],
  }

  test('shouldEvaluate should return true if there are related subjects', () => {
    expect(
      plugin.shouldEvaluate(
        createCheckAnswerInput('たべる', 'reading', kanjiSubjectEnr),
      ),
    ).toBe(true)
  })

  test('shouldEvaluate should return false if there are no related subjects', () => {
    const emptySubject: EnrichedSubject<any> = {
      subject: {
        type: 'kanji',
        meanings: [],
        readings: [],
      },
      radicals: [],
      kanji: [],
      vocabulary: [],
    }
    expect(
      plugin.shouldEvaluate(
        createCheckAnswerInput('たべる', 'reading', emptySubject),
      ),
    ).toBe(false)
  })

  test('evaluate should return hint for vocabulary reading when kanji reading is provided', () => {
    const response = kanjiSubject.readings[0].reading
    const result = plugin.evaluate(
      createCheckAnswerInput(response, 'reading', vocabSubjectEnr),
    )
    expect(result).toMatchObject({
      status: 'hint',
      message: 'Oops, we want the vocabulary reading, not the kanji reading.',
    })
  })

  test('evaluate should return hint for vocabulary meaning when kanji meaning is provided', () => {
    const response = kanjiSubject.meanings[0].meaning
    const result = plugin.evaluate(
      createCheckAnswerInput(response, 'meaning', vocabSubjectEnr),
    )
    expect(result).toMatchObject({
      status: 'hint',
      message: 'Oops, we want the vocabulary meaning, not the kanji meaning.',
    })
  })

  test('evaluate should return hint for kanji reading when vocabulary reading is provided', () => {
    const response = vocabSubject.readings[0].reading
    const result = plugin.evaluate(
      createCheckAnswerInput(response, 'reading', kanjiSubjectEnr),
    )
    expect(result).toMatchObject({
      status: 'hint',
      message: 'Oops, we want the kanji reading, not the vocabulary reading.',
    })
  })

  test('evaluate should return hint for kanji meaning when vocabulary meaning is provided', () => {
    const response = vocabSubject.meanings[0].meaning
    const result = plugin.evaluate(
      createCheckAnswerInput(response, 'meaning', kanjiSubjectEnr),
    )
    expect(result).toMatchObject({
      status: 'hint',
      message: 'Oops, we want the kanji meaning, not the vocabulary meaning.',
    })
  })

  test('evaluate should return hint for kanji meaning when radical meaning is provided', () => {
    const enrichedSubjectWithRadicals: EnrichedSubject<any> = {
      ...kanjiSubjectEnr,
      radicals: [
        { type: 'radical', meanings: [{ meaning: 'eat' }] } as Radical,
      ],
    }
    const response = 'eat'
    const result = plugin.evaluate(
      createCheckAnswerInput(response, 'meaning', enrichedSubjectWithRadicals),
    )
    expect(result).toMatchObject({
      status: 'hint',
      message: 'Oops, we want the kanji meaning, not the radical meaning.',
    })
  })

  test('evaluate should return undefined for correct kanji reading', () => {
    const response = 'しょく'
    const result = plugin.evaluate(
      createCheckAnswerInput(response, 'reading', kanjiSubjectEnr),
    )
    expect(result).toBeUndefined()
  })

  test('evaluate should return undefined for correct vocabulary meaning', () => {
    const response = vocabSubject.meanings[0].meaning
    const result = plugin.evaluate(
      createCheckAnswerInput(response, 'meaning', vocabSubjectEnr),
    )
    expect(result).toBeUndefined()
  })

  test('evaluate should return undefined for unrelated subject types', () => {
    const kanaVocabSubject: EnrichedSubject<any> = {
      subject: {
        type: 'kana_vocabulary',
        meanings: [{ meaning: 'あい' }],
        readings: [{ reading: 'あい' }],
      },
      radicals: [],
      kanji: [],
      vocabulary: [],
    }
    const response = 'あい'
    const result = plugin.evaluate(
      createCheckAnswerInput(response, 'reading', kanaVocabSubject),
    )
    expect(result).toBeUndefined()
  })
})
