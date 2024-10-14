/**
 * Represents the parameters required to create a review in the WaniKani system.
 */
export interface CreateReviewParams {
  /**
   * Unique identifier of the assignment.
   * This or `subject_id` must be set.
   */
  assignment_id?: number

  /**
   * Unique identifier of the subject.
   * This or `assignment_id` must be set.
   */
  subject_id?: number

  /**
   * Must be zero or a positive number.
   * This is the number of times the meaning was answered incorrectly.
   */
  incorrect_meaning_answers: number

  /**
   * Must be zero or a positive number.
   * This is the number of times the reading was answered incorrectly.
   * Note that subjects with a type of radical do not quiz on readings. Thus, set this value to 0.
   */
  incorrect_reading_answers: number

  /**
   * Timestamp when the review was completed.
   * Defaults to the time of the request if omitted from the request body.
   * Must be in the past, but after `assignment.available_at`.
   */
  created_at?: number
}
