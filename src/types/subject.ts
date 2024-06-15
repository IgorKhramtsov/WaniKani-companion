import { Colors } from '../constants/Colors'
import { StringUtils } from '../utils/stringUtils'
import { AuxiliaryMeaning } from './auxiliaryMeaning'
import { KanaVocabulary } from './kanaVocabulary'
import { Kanji } from './kanji'
import { Meaning } from './meaning'
import { PronunciationAudio } from './pronunciationAudio'
import { Radical } from './radical'
import { Reading } from './reading'
import { Vocabulary } from './vocabulary'

export type SubjectType = Radical | Kanji | Vocabulary | KanaVocabulary
export type SubjectTypeString = SubjectType['type']

/**
 * Represents a subject in the WaniKani system.
 */
export interface Subject {
  type: string

  /**
   * The id of the subject. Assigned manually in the WaniKani API
   * implementation
   */
  id: number

  /**
   * Collection of auxiliary meanings.
   * Each auxiliary meaning object includes a meaning and its type (whitelist or blacklist).
   */
  auxiliary_meanings: AuxiliaryMeaning[]

  /**
   * The UTF-8 characters for the subject, including kanji and hiragana.
   * Radicals can have a null value for characters if they are visually represented with an image instead.
   */
  characters: string | null

  /**
   * Timestamp when the subject was created.
   */
  created_at: Date

  /**
   * A URL pointing to the page on wanikani.com that provides detailed information about this subject.
   */
  document_url: string

  /**
   * Timestamp when the subject was hidden.
   * If hidden, associated assignments will no longer appear in lessons or reviews,
   * and the subject page will no longer be visible on wanikani.com.
   */
  hidden_at: Date | null

  /**
   * The position that the subject appears in lessons.
   * The value is scoped to the level of the subject, so there can be duplicate values across levels.
   */
  lesson_position: number

  /**
   * The level of the subject, ranging from 1 to 60.
   */
  level: number

  /**
   * The subject's meaning mnemonic, used to aid in memorization.
   */
  meaning_mnemonic: string

  /**
   * The subject meanings.
   * Each meaning object includes the meaning, its primary status, and whether it is accepted as an answer.
   */
  meanings: Meaning[]

  /**
   * The string used when generating the document URL for the subject.
   * Radicals use their meaning (downcased), while kanji and vocabulary use their characters.
   */
  slug: string

  /**
   * Unique identifier of the associated spaced repetition system.
   */
  spaced_repetition_system_id: number
}

export namespace SubjectUtils {
  export const getPrimaryMeaning = (subject: Subject): Meaning | undefined =>
    subject.meanings.find(el => el.primary)
  export const getOtherMeaning = (subject: Subject): Meaning[] =>
    subject.meanings.filter(el => !el.primary)

  export const getPrimaryReadings = (subject: Kanji | Vocabulary): Reading[] =>
    subject.readings.filter(el => el.primary)

  export const getPrononciationAudioForReading = (
    subject: Vocabulary | KanaVocabulary,
    reading: Reading,
  ): PronunciationAudio[] =>
    subject.pronunciation_audios.filter(
      el => el.metadata.pronunciation === reading.reading,
    )

  export const getSubjectName = (subject: SubjectType) =>
    StringUtils.capitalizeFirstLetter(subject.type.toString()).split('_')[0]

  export const getPrimaryReadingType = (subject: Kanji) =>
    subject.readings.find(el => el.primary)?.type

  export function isRadical(subject: SubjectType): subject is Radical {
    return subject.type === 'radical'
  }
  export function isKanji(subject: SubjectType): subject is Kanji {
    return subject.type === 'kanji'
  }
  export function isVocabulary(subject: SubjectType): subject is Vocabulary {
    return subject.type === 'vocabulary'
  }
  export function isKanaVocabulary(
    subject: SubjectType,
  ): subject is KanaVocabulary {
    return subject.type === 'kana_vocabulary'
  }

  export function map<T>(
    subject: SubjectType,
    mapping: Record<SubjectType['type'], T>,
  ): T {
    return mapping[subject.type]
  }

  export function getAssociatedColor(subject: SubjectType): string {
    return map(subject, {
      kana_vocabulary: Colors.purple,
      vocabulary: Colors.purple,
      kanji: Colors.pink,
      radical: Colors.blue,
    })
  }
}
