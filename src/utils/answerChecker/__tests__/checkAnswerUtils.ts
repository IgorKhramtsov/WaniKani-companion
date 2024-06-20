import { Meaning } from '@/src/types/meaning'
import {
  checkMeaning,
  checkReading,
  normalizeString,
  questionTypeAndResponseMatch,
} from '../checkAnswerUtils'
import { Vocabulary } from '@/src/types/vocabulary'
import { AuxiliaryMeaning } from '@/src/types/auxiliaryMeaning'
import { Reading } from '@/src/types/reading'
import { Kanji } from '@/src/types/kanji'

describe('checkMeaning', () => {
  const createSubject = (
    meanings: Meaning[],
    auxiliary_meanings: AuxiliaryMeaning[] = [],
  ): Vocabulary =>
    ({
      type: 'vocabulary',
      meanings,
      auxiliary_meanings,
    }) as Vocabulary

  const createMeaning = (meaning: string, primary: boolean = false): Meaning =>
    ({
      meaning,
      primary,
    }) as Meaning
  const createAuxiliaryMeaning = (
    meaning: string,
    type: 'blacklist' | 'whitelist',
  ): AuxiliaryMeaning => ({ meaning, type })

  test('should return passed and accurate for exact match', () => {
    const subject = createSubject([createMeaning('eat')])
    const result = checkMeaning('eat', subject, [])
    expect(result).toEqual({
      passed: true,
      accurate: true,
      multipleAnswers: false,
    })
  })

  test('should return passed but not accurate for close match', () => {
    const subject = createSubject([createMeaning('eat')])
    const result = checkMeaning('ear', subject, [])
    expect(result).toEqual({
      passed: true,
      accurate: false,
      multipleAnswers: false,
    })
  })

  test('should return not passed and not accurate for no match', () => {
    const subject = createSubject([createMeaning('eat')])
    const result = checkMeaning('run', subject, [])
    expect(result).toEqual({
      passed: false,
      accurate: false,
      multipleAnswers: false,
    })
  })

  test('should return passed and accurate for user synonym', () => {
    const subject = createSubject([createMeaning('eat')])
    const result = checkMeaning('devour', subject, ['devour'])
    expect(result).toEqual({
      passed: true,
      accurate: true,
      multipleAnswers: false,
    })
  })

  test('should return not passed for blacklisted meaning', () => {
    const subject = createSubject(
      [createMeaning('father')],
      [createAuxiliaryMeaning('mother', 'blacklist')],
    )
    const result = checkMeaning('mother', subject, [])
    expect(result).toEqual({
      passed: false,
      accurate: false,
      multipleAnswers: false,
    })
  })

  test('should return passed and accurate for auxiliary whitelist meaning', () => {
    const subject = createSubject(
      [createMeaning('eat')],
      [createAuxiliaryMeaning('consume', 'whitelist')],
    )
    const result = checkMeaning('consume', subject, [])
    expect(result).toEqual({
      passed: true,
      accurate: true,
      multipleAnswers: false,
    })
  })

  test('should handle multiple meanings', () => {
    const subject = createSubject([
      createMeaning('eat'),
      createMeaning('consume'),
    ])
    const result = checkMeaning('consume', subject, [])
    expect(result).toEqual({
      passed: true,
      accurate: true,
      multipleAnswers: true,
    })
  })

  test('should handle digits in meanings', () => {
    const subject = createSubject([createMeaning('4 wheels')])
    const result = checkMeaning('4 wheels', subject, [])
    expect(result).toEqual({
      passed: true,
      accurate: true,
      multipleAnswers: false,
    })
  })

  test('should return not passed for no matching digits in meanings', () => {
    const subject = createSubject([createMeaning('4 wheels')])
    const result = checkMeaning('3 wheels', subject, [])
    expect(result).toEqual({
      passed: false,
      accurate: false,
      multipleAnswers: false,
    })
  })
})

describe('normalizeString', () => {
  test('should trim whitespace', () => {
    expect(normalizeString('  test  ')).toBe('test')
  })

  test('should convert to lowercase', () => {
    expect(normalizeString('TeSt')).toBe('test')
  })

  test('should replace hyphens with spaces', () => {
    expect(normalizeString('test-case')).toBe('test case')
  })

  test('should remove periods', () => {
    expect(normalizeString('test.case')).toBe('testcase')
  })

  test('should remove commas', () => {
    expect(normalizeString('test,case')).toBe('testcase')
  })

  test('should remove apostrophes', () => {
    expect(normalizeString("test'case")).toBe('testcase')
  })

  test('should remove right single quotation mark', () => {
    expect(normalizeString('test\u2019case')).toBe('testcase')
  })

  test('should remove slashes', () => {
    expect(normalizeString('test/case')).toBe('testcase')
  })

  test('should remove colons', () => {
    expect(normalizeString('test:case')).toBe('testcase')
  })

  test('should handle multiple replacements', () => {
    expect(normalizeString("Test-Case, with:multiple/characters.'")).toBe(
      'test case withmultiplecharacters',
    )
  })

  test('should handle empty strings', () => {
    expect(normalizeString('')).toBe('')
  })

  test('should handle strings with only whitespace', () => {
    expect(normalizeString('    ')).toBe('')
  })
})

describe('questionTypeAndResponseMatch', () => {
  test('should return true for reading task with kana response', () => {
    expect(questionTypeAndResponseMatch('reading', 'たべる')).toBe(true)
  })

  test('should return false for reading task with non-kana response', () => {
    expect(questionTypeAndResponseMatch('reading', 'taberu')).toBe(false)
  })

  test('should return true for meaning task with non-kana response', () => {
    expect(questionTypeAndResponseMatch('meaning', 'food')).toBe(true)
  })

  test('should return false for meaning task with kana response', () => {
    expect(questionTypeAndResponseMatch('meaning', 'たべもの')).toBe(false)
  })

  test('should return true for reading task with mixed kana and non-kana response ending in n', () => {
    expect(questionTypeAndResponseMatch('reading', 'たべるn')).toBe(true)
  })
})

describe('checkReading', () => {
  const createSubject = (readings: Reading[]): Kanji =>
    ({
      type: 'kanji',
      readings,
    }) as Kanji

  const createReading = (
    reading: string,
    accepted_answer: boolean = false,
  ): Reading =>
    ({
      reading,
      accepted_answer,
    }) as Reading

  test('should return passed and accurate for exact match', () => {
    const subject = createSubject([createReading('たべる', true)])
    const result = checkReading('たべる', subject)
    expect(result).toEqual({
      passed: true,
      accurate: true,
      multipleAnswers: false,
    })
  })

  test('should return not passed and not accurate for no match', () => {
    const subject = createSubject([createReading('たべる', true)])
    const result = checkReading('のむ', subject)
    expect(result).toEqual({
      passed: false,
      accurate: false,
      multipleAnswers: false,
    })
  })

  test('should return passed and accurate with multiple correct answers', () => {
    const subject = createSubject([
      createReading('たべる', true),
      createReading('くう', true),
    ])
    const result = checkReading('たべる', subject)
    expect(result).toEqual({
      passed: true,
      accurate: true,
      multipleAnswers: true,
    })
  })

  test('should return not passed for unaccepted reading', () => {
    const subject = createSubject([createReading('たべる', false)])
    const result = checkReading('たべる', subject)
    expect(result).toEqual({
      passed: false,
      accurate: false,
      multipleAnswers: false,
    })
  })

  test('should return passed and accurate for exact match in vocabulary', () => {
    const subject = {
      type: 'vocabulary',
      readings: [createReading('たべもの', true)],
    } as Vocabulary
    const result = checkReading('たべもの', subject)
    expect(result).toEqual({
      passed: true,
      accurate: true,
      multipleAnswers: false,
    })
  })
})
