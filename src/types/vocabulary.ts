import { SubjectBase } from './subject'
import { Reading } from './reading'
import { ContextSentence } from './contextSentence'
import { PronunciationAudio } from './pronunciationAudio'

/**
 * Represents a vocabulary item in the WaniKani system.
 * Vocabulary items are words made up of kanji and kana.
 */
export interface Vocabulary extends SubjectBase {
  type: 'vocabulary'
  /**
   * An array of numeric identifiers for the kanji that make up this vocabulary.
   * These are the subjects that must have passed assignments in order to unlock this subject's assignment.
   */
  component_subject_ids: number[]

  /**
   * A collection of context sentences to demonstrate the usage of the vocabulary.
   * Each context sentence object includes the sentence in Japanese and its English translation.
   */
  context_sentences: ContextSentence[]

  /**
   * The subject's meaning mnemonic, used to aid in memorization.
   */
  meaning_mnemonic: string

  /**
   * Parts of speech for the vocabulary item.
   */
  parts_of_speech: string[]

  /**
   * A collection of pronunciation audio for the vocabulary.
   * Each pronunciation audio object includes the URL, content type, and metadata about the audio.
   */
  pronunciation_audios: PronunciationAudio[]

  /**
   * Selected readings for the vocabulary.
   * Each reading object includes the reading, its primary status, and acceptance as an answer.
   */
  readings: Reading[]

  /**
   * The subject's reading mnemonic, used to aid in memorization.
   */
  reading_mnemonic: string
}
