import { AuxiliaryMeaning } from "./auxiliaryMeaning";
import { KanaVocabulary } from "./kanaVocabulary";
import { Kanji } from "./kanji";
import { Meaning } from "./meaning";
import { Radical } from "./radical";
import { Vocabulary } from "./vocabulary";

export type SubjectType = Radical | Kanji | Vocabulary | KanaVocabulary;

/**
 * Represents a subject in the WaniKani system.
 */
export interface Subject {
  /**
   * Collection of auxiliary meanings.
   * Each auxiliary meaning object includes a meaning and its type (whitelist or blacklist).
   */
  auxiliary_meanings: AuxiliaryMeaning[];
  
  /**
   * The UTF-8 characters for the subject, including kanji and hiragana.
   * Radicals can have a null value for characters if they are visually represented with an image instead.
   */
  characters: string | null;
  
  /**
   * Timestamp when the subject was created.
   */
  created_at: Date;
  
  /**
   * A URL pointing to the page on wanikani.com that provides detailed information about this subject.
   */
  document_url: string;
  
  /**
   * Timestamp when the subject was hidden.
   * If hidden, associated assignments will no longer appear in lessons or reviews,
   * and the subject page will no longer be visible on wanikani.com.
   */
  hidden_at: Date | null;
  
  /**
   * The position that the subject appears in lessons.
   * The value is scoped to the level of the subject, so there can be duplicate values across levels.
   */
  lesson_position: number;
  
  /**
   * The level of the subject, ranging from 1 to 60.
   */
  level: number;
  
  /**
   * The subject's meaning mnemonic, used to aid in memorization.
   */
  meaning_mnemonic: string;
  
  /**
   * The subject meanings.
   * Each meaning object includes the meaning, its primary status, and whether it is accepted as an answer.
   */
  meanings: Meaning[];
  
  /**
   * The string used when generating the document URL for the subject.
   * Radicals use their meaning (downcased), while kanji and vocabulary use their characters.
   */
  slug: string;
  
  /**
   * Unique identifier of the associated spaced repetition system.
   */
  spaced_repetition_system_id: number;
}

