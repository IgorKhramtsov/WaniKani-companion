import { Subject } from '@/src/types/subject'
import { Vocabulary } from '@/src/types/vocabulary'
import { CheckAnswerPluginInput } from '../../checkAnswerPlugin'
import plugin from '../checkThatVerbStartsWithToPlugin'

describe('checkThatVerbStartsWithToPlugin', () => {
  const subjectVocabNonVerb: Vocabulary = {
    type: 'vocabulary',
    meanings: [{ meaning: 'stop', accepted_answer: true }],
    characters: '止',
  } as Vocabulary

  const subjectVocab: Vocabulary = {
    type: 'vocabulary',
    meanings: [{ meaning: 'to stop something', accepted_answer: true }],
    characters: '止める',
  } as Vocabulary

  const getInput = (
    response: string,
    subject: Subject,
    taskType: string,
    passed: boolean,
  ): CheckAnswerPluginInput => ({
    response,
    subject: {
      subject,
      radicals: [],
      kanji: [],
      vocabulary: [],
    },
    taskType: taskType as any,
    checkResult: {
      passed,
    } as any,
    userSynonyms: [],
  })

  test('shouldEvaluate should return true for these cases', () => {
    expect(
      plugin.shouldEvaluate(
        getInput('stop something', subjectVocab, 'meaning', false),
      ),
    ).toBe(true)
  })

  test('shouldEvaluate should return false for reading task or correct or non-verb', () => {
    expect(
      plugin.shouldEvaluate(getInput('にん', subjectVocab, 'reading', false)),
    ).toBe(false)
    expect(
      plugin.shouldEvaluate(
        getInput('To stop something', subjectVocab, 'meaning', true),
      ),
    ).toBe(false)
    expect(
      plugin.shouldEvaluate(
        getInput('to stop something', subjectVocabNonVerb, 'meaning', false),
      ),
    ).toBe(false)
  })

  test('evaluate should return hint for verb that does not start with "to"', () => {
    const response = 'stop something'
    const result = plugin.evaluate(
      getInput(response, subjectVocab, 'meaning', false),
    )

    expect(result).toMatchObject({
      status: 'hint',
      message: expect.stringContaining('so it’s a verb'),
    })
  })

  test('evaluate should return undefined for response that does not start with "to" and do not match correct meaning', () => {
    const response = 'start something'
    const result = plugin.evaluate(
      getInput(response, subjectVocab, 'meaning', false),
    )

    expect(result).toBeUndefined()
  })
})
