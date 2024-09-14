import { Radical } from '@/src/types/radical'
import { EnrichedSubject } from '../types/enrichedSubject'
import { checkAnswer } from '../answerChecker'
import { Kanji } from '@/src/types/kanji'
import { Meaning } from '@/src/types/meaning'

describe('checkAnswer', () => {
  describe('Meaning', () => {
    const createMockSubject = (
      meanings: string[],
      auxiliaryMeanings: { meaning: string; type: 'whitelist' | 'blacklist' }[],
    ): EnrichedSubject => ({
      subject: {
        type: 'radical',
        id: 1,
        meanings: meanings.map(meaning => ({
          meaning,
          primary: true,
          accepted_answer: true,
        })),
        auxiliary_meanings: auxiliaryMeanings,
      } as Radical,
      radicals: [],
      kanji: [],
      vocabulary: [],
    })

    test('should return correct for exact match', () => {
      const subject = createMockSubject(['water'], [])
      const result = checkAnswer({
        taskType: 'meaning',
        input: 'water',
        subject,
        userSynonyms: [],
      })
      expect(result.status).toBe('correct')
    })

    test('should return correct for case-insensitive match', () => {
      const subject = createMockSubject(['Water'], [])
      const result = checkAnswer({
        taskType: 'meaning',
        input: 'water',
        subject,
        userSynonyms: [],
      })
      expect(result.status).toBe('correct')
    })

    test('should return correct for whitelist auxiliary meaning', () => {
      const subject = createMockSubject(
        ['water'],
        [{ meaning: 'liquid', type: 'whitelist' }],
      )
      const result = checkAnswer({
        taskType: 'meaning',
        input: 'liquid',
        subject,
        userSynonyms: [],
      })
      expect(result.status).toBe('correct')
    })

    test('should return incorrect for blacklist auxiliary meaning', () => {
      const subject = createMockSubject(
        ['water'],
        [{ meaning: 'fire', type: 'blacklist' }],
      )
      const result = checkAnswer({
        taskType: 'meaning',
        input: 'fire',
        subject,
        userSynonyms: [],
      })
      expect(result.status).toBe('incorrect')
    })

    test('should return correct for user synonym', () => {
      const subject = createMockSubject(['water'], [])
      const result = checkAnswer({
        taskType: 'meaning',
        input: 'h2o',
        subject,
        userSynonyms: ['h2o'],
      })
      expect(result.status).toBe('correct')
    })

    test('should return incorrect for wrong answer', () => {
      const subject = createMockSubject(['water'], [])
      const result = checkAnswer({
        taskType: 'meaning',
        input: 'fire',
        subject,
        userSynonyms: [],
      })
      expect(result.status).toBe('incorrect')
    })

    test('should return correctWithHint for close match', () => {
      const subject = createMockSubject(['water'], [])
      const result = checkAnswer({
        taskType: 'meaning',
        input: 'watr',
        subject,
        userSynonyms: [],
      })
      expect(result.status).toBe('correctWithHint')
    })

    test('should handle multiple correct meanings', () => {
      const subject = createMockSubject(['water', 'liquid'], [])
      const result = checkAnswer({
        taskType: 'meaning',
        input: 'liquid',
        subject,
        userSynonyms: [],
      })
      expect(result.status).toBe('correct')
      expect(result.message).toBe(
        'Did you know this item has multiple possible meanings?',
      )
    })

    test('should handle user synonym that is also blacklisted', () => {
      const subject = createMockSubject(
        ['water'],
        [{ meaning: 'fire', type: 'blacklist' }],
      )
      const result = checkAnswer({
        taskType: 'meaning',
        input: 'fire',
        subject,
        userSynonyms: ['fire'],
      })
      expect(result.status).toBe('incorrect')
      expect(result.message).toBe(
        'That’s one of your synonyms, but we can’t accept it because it’s not a valid meaning.',
      )
    })

    test('should return incorrect for wrong number used', () => {
      const subject = createMockSubject(['2 days'], [])
      const result = checkAnswer({
        taskType: 'meaning',
        input: '3 days',
        subject,
        userSynonyms: [],
      })
      expect(result.status).toBe('incorrect')
    })
  })

  describe('Reading', () => {
    const createMockSubject = (
      readings: {
        reading: string
        primary: boolean
        accepted_answer: boolean
      }[],
    ): EnrichedSubject => ({
      subject: {
        type: 'kanji',
        id: 1,
        readings,
        meanings: [] as Meaning[],
      } as Kanji,
      radicals: [],
      kanji: [],
      vocabulary: [],
    })

    test('should return correct for exact match', () => {
      const subject = createMockSubject([
        { reading: 'みず', primary: true, accepted_answer: true },
      ])
      const result = checkAnswer({
        taskType: 'reading',
        input: 'みず',
        subject,
        userSynonyms: [],
      })
      expect(result.status).toBe('correct')
    })

    test('should return correct for alternative accepted reading', () => {
      const subject = createMockSubject([
        { reading: 'みず', primary: true, accepted_answer: true },
        { reading: 'すい', primary: false, accepted_answer: true },
      ])
      const result = checkAnswer({
        taskType: 'reading',
        input: 'すい',
        subject,
        userSynonyms: [],
      })
      expect(result.status).toBe('correct')
    })

    test('should return incorrect for wrong reading', () => {
      const subject = createMockSubject([
        { reading: 'みず', primary: true, accepted_answer: true },
      ])
      const result = checkAnswer({
        taskType: 'reading',
        input: 'みづ',
        subject,
        userSynonyms: [],
      })
      expect(result.status).toBe('incorrect')
    })

    test('should handle multiple correct readings', () => {
      const subject = createMockSubject([
        { reading: 'みず', primary: true, accepted_answer: true },
        { reading: 'すい', primary: false, accepted_answer: true },
      ])
      const result = checkAnswer({
        taskType: 'reading',
        input: 'みず',
        subject,
        userSynonyms: [],
      })
      expect(result.status).toBe('correct')
      expect(result.message).toBe(
        'Did you know this item has multiple possible readings?',
      )
    })

    // TODO: move to plugin tests
    test('should handle small kana correctly', () => {
      const subject = createMockSubject([
        { reading: 'きょう', primary: true, accepted_answer: true },
      ])
      const result = checkAnswer({
        taskType: 'reading',
        input: 'きよう',
        subject,
        userSynonyms: [],
      })
      expect(result.status).toBe('hint')
    })
  })
})
