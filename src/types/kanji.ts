import { Subject } from './subject';
import { Reading } from './reading';

/**
 * Represents a kanji in the WaniKani system.
 * Kanji are characters used in the Japanese writing system.
 */
export interface Kanji extends Subject {
  /**
   * An array of numeric identifiers for the vocabulary that have the kanji as a component.
   */
  amalgamation_subject_ids: number[];
  
  /**
   * An array of numeric identifiers for the radicals that make up this kanji.
   * These are the subjects that must have passed assignments in order to unlock this subject's assignment.
   */
  component_subject_ids: number[];
  
  /**
   * A hint to help users remember the meaning of the kanji.
   */
  meaning_hint: string | null;
  
  /**
   * A hint to help users remember the reading of the kanji.
   */
  reading_hint: string | null;
  
  /**
   * The kanji's reading mnemonic, used to aid in memorization.
   */
  reading_mnemonic: string;
  
  /**
   * Selected readings for the kanji.
   * Each reading object includes the reading, its primary status, acceptance as an answer, and its type (kunyomi, nanori, or onyomi).
   */
  readings: Reading[];
  
  /**
   * An array of numeric identifiers for kanji which are visually similar to the kanji in question.
   */
  visually_similar_subject_ids: number[];
}

