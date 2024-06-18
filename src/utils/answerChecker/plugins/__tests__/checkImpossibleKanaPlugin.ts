import { CheckAnswerPluginInput } from '../../checkAnswerPlugin'
import { plugin } from '../checkImpossibleKanaPlugin'

describe('checkImpossibleKanaPlugin', () => {
  const createCheckAnswerInput = (
    response: string,
    taskType: string,
    checkResult: any,
  ): CheckAnswerPluginInput => ({
    response,
    taskType: taskType as any,
    checkResult,
    subject: {} as any,
    userSynonyms: [],
  })

  const passed = { passed: true }
  const notPassed = { passed: false }

  test('shouldEvaluate should return true for reading tasks with failed check results', () => {
    const response = 'にん'
    expect(
      plugin.shouldEvaluate(
        createCheckAnswerInput(response, 'reading', notPassed),
      ),
    ).toBe(true)
  })

  test('shouldEvaluate should return false for passed check results', () => {
    const response = 'にん'
    expect(
      plugin.shouldEvaluate(
        createCheckAnswerInput(response, 'reading', passed),
      ),
    ).toBe(false)
  })

  test('shouldEvaluate should return false for non-reading tasks', () => {
    const response = 'にん'
    expect(
      plugin.shouldEvaluate(
        createCheckAnswerInput(response, 'meaning', notPassed),
      ),
    ).toBe(false)
  })

  test.each([
    ['んいん'], // Invalid starting character
    ['んゅしょ'], // Invalid adjacent characters
    ['んょ'], // Invalid adjacent characters
    ['んん'], // Invalid adjacent characters
    ['っあ'], // Invalid small TSU
    ['きゃゃ'], // Invalid small YaYuYo
  ])(
    'evaluate should return a hint for impossible kana sequences: %s',
    response => {
      const result = plugin.evaluate(
        createCheckAnswerInput(response, 'reading', notPassed),
      )
      expect(result).toMatchObject({
        status: 'hint',
        message: 'That looks like a typo. Do you want to retry?',
      })
    },
  )

  test.each([
    ['にん'], // Valid response
    ['きょう'], // Valid response
    ['たべる'], // Valid response
  ])('evaluate should return undefined for valid responses: %s', response => {
    const result = plugin.evaluate(
      createCheckAnswerInput(response, 'reading', notPassed),
    )
    expect(result).toBeUndefined()
  })
})
