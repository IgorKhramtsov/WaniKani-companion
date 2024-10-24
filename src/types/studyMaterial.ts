/**
 * Interface representing the structure of Study Material data.
 */
export interface StudyMaterial {
  id: number

  /**
   * Timestamp when the study material was created.
   */
  created_at: number

  /**
   * Indicates if the associated subject has been hidden, preventing it from appearing in lessons or reviews.
   */
  hidden: boolean

  /**
   * Free form note related to the meaning(s) of the associated subject.
   * Can be null if no note is provided.
   */
  meaning_note: string | null

  /**
   * Synonyms for the meaning of the subject.
   * These are used as additional correct answers during reviews.
   */
  meaning_synonyms: string[]

  /**
   * Free form note related to the reading(s) of the associated subject.
   * Can be null if no note is provided.
   */
  reading_note: string | null

  /**
   * Unique identifier of the associated subject.
   */
  subject_id: number

  /**
   * The type of the associated subject.
   * One of: "kana_vocabulary", "kanji", "radical", or "vocabulary".
   */
  subject_type: 'kana_vocabulary' | 'kanji' | 'radical' | 'vocabulary'
}
