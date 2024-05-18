/**
 * Represents a reading of a subject.
 */
export interface Reading {
  /**
   * A singular subject reading.
   */
  reading: string;
  
  /**
   * Indicates priority in the WaniKani system.
   */
  primary: boolean;
  
  /**
   * Indicates if the reading is used to evaluate user input for correctness.
   */
  accepted_answer: boolean;
  
  /**
   * The kanji reading's classification: kunyomi, nanori, or onyomi.
   * This attribute is optional and may not be present on all readings.
   */
  type?: 'kunyomi' | 'nanori' | 'onyomi';
}

