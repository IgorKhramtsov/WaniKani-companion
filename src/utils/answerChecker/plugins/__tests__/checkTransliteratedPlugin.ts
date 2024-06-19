import { TaskType } from '@/src/types/quizTaskType'
import { EnrichedSubject } from '../../types/enrichedSubject'
import { CheckAnswerPluginInput } from '../../checkAnswerPlugin'
import { Kanji } from '@/src/types/kanji'
import { Vocabulary } from '@/src/types/vocabulary'
import { plugin } from '../checkTransliteratedPlugin'

describe('checkTransliteratedPlugin', () => {
  const createCheckAnswerInput = (
    response: string,
    taskType: TaskType,
    enrichedSubject: EnrichedSubject<any>,
    userSynonyms: string[] = [],
  ): CheckAnswerPluginInput => ({
    response,
    taskType,
    checkResult: { passed: false } as any,
    subject: enrichedSubject,
    userSynonyms,
  })

  const kanjiSubject: EnrichedSubject<Kanji> = {
    subject: {
      type: 'kanji',
      readings: [{ reading: 'しょく' }],
      meanings: [{ meaning: 'eat' }],
    } as Kanji,
    radicals: [],
    kanji: [],
    vocabulary: [],
  }

  const vocabSubject: EnrichedSubject<Vocabulary> = {
    subject: {
      type: 'vocabulary',
      readings: [{ reading: 'たべもの' }],
      meanings: [{ meaning: 'food' }],
    } as Vocabulary,
    radicals: [],
    kanji: [],
    vocabulary: [],
  }

  test('shouldEvaluate should return true if the check result did not pass', () => {
    const response = kanjiSubject.subject.readings[0].reading
    expect(
      plugin.shouldEvaluate(
        createCheckAnswerInput(response, 'reading', kanjiSubject),
      ),
    ).toBe(true)
  })

  test('shouldEvaluate should return false if the check result passed', () => {
    const input: CheckAnswerPluginInput = {
      response: kanjiSubject.subject.readings[0].reading,
      taskType: 'reading',
      checkResult: { passed: true } as any,
      subject: kanjiSubject,
      userSynonyms: [],
    }
    expect(plugin.shouldEvaluate(input)).toBe(false)
  })

  test('evaluate should return hint for matched kanji reading when meaning is expected', () => {
    const response = kanjiSubject.subject.readings[0].reading
    const result = plugin.evaluate(
      createCheckAnswerInput(response, 'meaning', kanjiSubject),
    )
    expect(result).toMatchObject({
      status: 'hint',
      message: 'Oops, we want the meaning, not the reading.',
    })
  })

  test('evaluate should return hint for matched vocabulary reading when meaning is expected', () => {
    const response = vocabSubject.subject.readings[0].reading
    const result = plugin.evaluate(
      createCheckAnswerInput(response, 'meaning', vocabSubject),
    )
    expect(result).toMatchObject({
      status: 'hint',
      message: 'Oops, we want the meaning, not the reading.',
    })
  })

  test('evaluate should return hint for matched kanji meaning when reading is expected', () => {
    const response = kanjiSubject.subject.meanings[0].meaning
    const result = plugin.evaluate(
      createCheckAnswerInput(response, 'reading', kanjiSubject),
    )
    expect(result).toMatchObject({
      status: 'hint',
      message: 'Oops, we want the reading, not the meaning.',
    })
  })

  test('evaluate should return hint for matched vocabulary meaning when reading is expected', () => {
    const response = vocabSubject.subject.meanings[0].meaning
    const result = plugin.evaluate(
      createCheckAnswerInput(response, 'reading', vocabSubject),
    )
    expect(result).toMatchObject({
      status: 'hint',
      message: 'Oops, we want the reading, not the meaning.',
    })
  })

  test('evaluate should return undefined for correct kanji reading', () => {
    const response = kanjiSubject.subject.readings[0].reading
    const result = plugin.evaluate(
      createCheckAnswerInput(response, 'reading', kanjiSubject),
    )
    expect(result).toBeUndefined()
  })

  test('evaluate should return undefined for correct vocabulary meaning', () => {
    const response = vocabSubject.subject.meanings[0].meaning
    const result = plugin.evaluate(
      createCheckAnswerInput(response, 'meaning', vocabSubject),
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
