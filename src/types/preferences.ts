export type ReviewsPresentationOrder = 'shuffled' | 'lower_levels_first'

/**
 * Preferences Object Attributes
 */
export interface Preferences {
  /**
   * @deprecated This is a deprecated user preference. It will always return 1 and cannot be set.
   * It exists only to ensure existing consumers of this API don't break.
   */
  default_voice_actor_id: number // This will always be 1

  /**
   * Automatically play pronunciation audio for vocabulary during extra study.
   */
  extra_study_autoplay_audio: boolean

  /**
   * Automatically play pronunciation audio for vocabulary during lessons.
   */
  lessons_autoplay_audio: boolean

  /**
   * Number of subjects introduced to the user during lessons before quizzing.
   */
  lessons_batch_size: number

  /**
   * This is a deprecated user preference. It always returns ascending_level_then_subject.
   * Setting this preference will do nothing. It exists only to ensure existing consumers of this API don't break.
   */
  lessons_presentation_order: 'ascending_level_then_subject' // Deprecated

  /**
   * Automatically play pronunciation audio for vocabulary during reviews.
   */
  reviews_autoplay_audio: boolean

  /**
   * Toggle for display SRS change indicator after a subject has been completely answered during review.
   */
  reviews_display_srs_indicator: boolean

  /**
   * The order in which reviews are presented. The options are shuffled and lower_levels_first.
   * The default (and best experience) is shuffled.
   */
  reviews_presentation_order: ReviewsPresentationOrder
}

export const defaultPreferences: Preferences = {
  default_voice_actor_id: 1, // always 1
  extra_study_autoplay_audio: false,
  lessons_autoplay_audio: false,
  lessons_batch_size: 5,
  lessons_presentation_order: 'ascending_level_then_subject', // Deprecated
  reviews_autoplay_audio: false,
  reviews_display_srs_indicator: false,
  reviews_presentation_order: 'lower_levels_first',
}
