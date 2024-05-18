/**
 * Represents a review in the WaniKani system.
 */
export interface Review {
  /**
   * Unique identifier of the associated assignment.
   */
  assignment_id: number;

  /**
   * Timestamp when the review was created.
   */
  created_at: Date;

  /**
   * The SRS stage interval calculated from the number of correct and incorrect answers,
   * with valid values ranging from 1 to 9.
   */
  ending_srs_stage: number;

  /**
   * The number of times the user has answered the meaning incorrectly.
   * Returns a value of 0 for subjects which do not require a meaning answer.
   */
  incorrect_meaning_answers: number;

  /**
   * The number of times the user has answered the reading incorrectly.
   * Returns a value of 0 for subjects which do not require a reading answer.
   */
  incorrect_reading_answers: number;

  /**
   * Unique identifier of the associated spaced repetition system.
   * This preserves the SRS system used at the time the review was created.
   */
  spaced_repetition_system_id: number;

  /**
   * The starting SRS stage interval, with valid values ranging from 1 to 8.
   */
  starting_srs_stage: number;

  /**
   * Unique identifier of the associated subject.
   */
  subject_id: number;
}
