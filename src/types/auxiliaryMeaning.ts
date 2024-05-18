/**
 * Represents an auxiliary meaning for a subject.
 */
export interface AuxiliaryMeaning {
  /**
   * A singular subject meaning.
   */
  meaning: string;
  
  /**
   * The type of auxiliary meaning, either 'whitelist' or 'blacklist'.
   * When evaluating user input, whitelisted meanings are used to match for correctness,
   * and blacklisted meanings are used to match for incorrectness.
   */
  type: 'whitelist' | 'blacklist';
}

