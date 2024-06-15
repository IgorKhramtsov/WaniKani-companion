import { SubjectBase } from './subject';
import { ContextSentence } from './contextSentence';
import { PronunciationAudio } from './pronunciationAudio';

/**
 * Represents a kana vocabulary item in the WaniKani system.
 * Kana vocabulary items are words made up of kana only.
 */
export interface KanaVocabulary extends SubjectBase {
  type: 'kana_vocabulary'

  /**
   * A collection of context sentences to demonstrate the usage of the kana vocabulary.
   * Each context sentence object includes the sentence in Japanese and its English translation.
   */
  context_sentences: ContextSentence[];

  /**
   * The subject's meaning mnemonic, used to aid in memorization.
   */
  meaning_mnemonic: string;

  /**
   * Parts of speech for the kana vocabulary item.
   */
  parts_of_speech: string[];

  /**
   * A collection of pronunciation audio for the kana vocabulary.
   * Each pronunciation audio object includes the URL, content type, and metadata about the audio.
   */
  pronunciation_audios: PronunciationAudio[];
}

