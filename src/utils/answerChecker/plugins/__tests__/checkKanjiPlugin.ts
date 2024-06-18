import { Subject } from '@/src/types/subject'
import { EnrichedSubject } from '../../types/enrichedSubject'
import { CheckAnswerPluginInput } from '../../checkAnswerPlugin'
import plugin from '../checkKanjiPlugin'

describe('checkKanjiPlugin', () => {
  const subject: EnrichedSubject<Subject> = {
    subject: {
      characters: '食べる',
    } as Subject,
    radicals: [],
    kanji: [],
    vocabulary: [],
  }

  const createCheckAnswerInput = (
    response: string,
  ): CheckAnswerPluginInput => ({
    response,
    taskType: 'meaning',
    checkResult: { passed: false } as any,
    subject,
    userSynonyms: [],
  })

  test('shouldEvaluate should return true when subject characters match response', () => {
    const response = '食べる'
    expect(plugin.shouldEvaluate(createCheckAnswerInput(response))).toBe(true)
  })

  test('shouldEvaluate should return false when subject characters do not match response', () => {
    const response = 'たべる'
    expect(plugin.shouldEvaluate(createCheckAnswerInput(response))).toBe(false)
  })

  test('evaluate should return a hint with undefined message', () => {
    const result = plugin.evaluate(createCheckAnswerInput('食べる'))
    expect(result).toMatchObject({
      status: 'hint',
      message: undefined,
    })
  })
})
