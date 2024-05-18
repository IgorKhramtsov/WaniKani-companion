/**
 * Represents a singular meaning of a subject.
 */
export interface Meaning {
  /**
   * A singular subject meaning.
   */
  meaning: string;
  
  /**
   * Indicates priority in the WaniKani system.
   */
  primary: boolean;
  
  /**
   * Indicates if the meaning is used to evaluate user input for correctness.
   */
  accepted_answer: boolean;
}

