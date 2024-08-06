/**
 * Represents the review statistics for a subject in the WaniKani system.
 */
export interface ReviewStatistic {
  id: number

  /**
   * Timestamp when the review statistic was created.
   */
  created_at: Date

  /**
   * Indicates if the associated subject has been hidden,
   * preventing it from appearing in lessons or reviews.
   */
  hidden: boolean

  /**
   * Total number of correct answers submitted for the meaning of the associated subject.
   */
  meaning_correct: number

  /**
   * The current, uninterrupted series of correct answers given for the meaning of the associated subject.
   */
  meaning_current_streak: number

  /**
   * Total number of incorrect answers submitted for the meaning of the associated subject.
   */
  meaning_incorrect: number

  /**
   * The longest, uninterrupted series of correct answers ever given for the meaning of the associated subject.
   */
  meaning_max_streak: number

  /**
   * The overall correct answer rate by the user for the subject,
   * including both meaning and reading.
   */
  percentage_correct: number

  /**
   * Total number of correct answers submitted for the reading of the associated subject.
   */
  reading_correct: number

  /**
   * The current, uninterrupted series of correct answers given for the reading of the associated subject.
   */
  reading_current_streak: number

  /**
   * Total number of incorrect answers submitted for the reading of the associated subject.
   */
  reading_incorrect: number

  /**
   * The longest, uninterrupted series of correct answers ever given for the reading of the associated subject.
   */
  reading_max_streak: number

  /**
   * Unique identifier of the associated subject.
   */
  subject_id: number

  /**
   * The type of the associated subject, one of: kana_vocabulary, kanji, radical, or vocabulary.
   */
  subject_type: 'kana_vocabulary' | 'kanji' | 'radical' | 'vocabulary'
}
