/**
 * Represents a user's progress through a WaniKani level.
 * A level progression is created when the user reaches a 90% passing rate on assignments
 * for the current level and meets the necessary prerequisites.
 */
export interface LevelProgression {
  /**
   * Unique identifier for the level progression.
   */
  id: number

  /**
   * Timestamp when the level progression was created.
   */
  created_at: string

  /**
   * The level of the progression, ranging from 1 to 60.
   */
  level: number

  /**
   * Timestamp when the user unlocks the level and gains access to lessons and reviews.
   * Can be `null` if not unlocked yet.
   */
  unlocked_at: string | null

  /**
   * Timestamp when the user starts their first lesson of a subject for this level.
   * Can be `null` if not started yet.
   */
  started_at: string | null

  /**
   * Timestamp when the user passes at least 90% of the assignments with a type of kanji
   * for this level. Can be `null` if not passed yet.
   */
  passed_at: string | null

  /**
   * Timestamp when the user completes all assignments for the level. Can be `null` if not completed yet.
   */
  completed_at: string | null

  /**
   * Timestamp when the user abandons the level, usually due to a reset. Can be `null`.
   */
  abandoned_at: string | null
}
