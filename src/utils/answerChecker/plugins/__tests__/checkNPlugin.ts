import { Subject } from '@/src/types/subject'
import plugin from '../checkNPlugin'
import { Kanji } from '@/src/types/kanji'
import { Vocabulary } from '@/src/types/vocabulary'
import { CheckAnswerPluginInput } from '../../checkAnswerPlugin'
import { Radical } from '@/src/types/radical'

describe('checkNPlugin', () => {
  const subjectKanji: Kanji = {
    type: 'kanji',
    readings: [{ reading: 'さんにん', accepted_answer: true }],
  } as Kanji

  const subjectVocab: Vocabulary = {
    type: 'vocabulary',
    readings: [{ reading: 'きん', accepted_answer: true }],
  } as Vocabulary

  const getInput = (
    response: string,
    subject: Subject,
    taskType: string,
  ): CheckAnswerPluginInput => ({
    response,
    subject: {
      subject,
      radicals: [],
      kanji: [],
      vocabulary: [],
    },
    taskType: taskType as any,
    checkResult: {} as any,
    userSynonyms: [],
  })

  test('shouldEvaluate should return true for reading tasks with Kanji or Vocabulary', () => {
    expect(
      plugin.shouldEvaluate(getInput('にん', subjectKanji, 'reading')),
    ).toBe(true)
    expect(
      plugin.shouldEvaluate(getInput('きん', subjectVocab, 'reading')),
    ).toBe(true)
  })

  test('shouldEvaluate should return false for non-reading tasks', () => {
    expect(
      plugin.shouldEvaluate(getInput('にん', subjectKanji, 'meaning')),
    ).toBe(false)
    expect(
      plugin.shouldEvaluate(getInput('きん', subjectVocab, 'meaning')),
    ).toBe(false)
  })

  test('evaluate should return hint for too few "n"s', () => {
    const response = 'さんいん' // Missing 'n'
    const result = plugin.evaluate(getInput(response, subjectKanji, 'reading'))

    expect(result).toMatchObject({
      status: 'hint',
      message: expect.stringContaining('ん is typed as “nn”'),
    })
  })

  // TEST: find a case
  //
  // test('evaluate should return hint for too many "n"s', () => {
  //   const response = 'ninn'
  //   const result = plugin.evaluate(getInput(response, subjectKanji, 'reading'))
  //   expect(result).toEqual({
  //     status: 'hint',
  //     message: 'That looks like a typo. Watch out for those "n"s.',
  //   })
  // })

  test('evaluate should return undefined for non-Kanji or non-Vocabulary subjects', () => {
    const subjectNonKanji: Radical = {
      type: 'radical',
    } as Radical
    const response = 'nin'
    const result = plugin.evaluate(
      getInput(response, subjectNonKanji, 'reading'),
    )
    expect(result).toBeUndefined()
  })
})
