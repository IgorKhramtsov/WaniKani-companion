import { Colors } from '../constants/Colors'
import { StringUtils } from '../utils/stringUtils'
import { AuxiliaryMeaning } from './auxiliaryMeaning'
import { KanaVocabulary } from './kanaVocabulary'
import { Kanji } from './kanji'
import { Meaning } from './meaning'
import { PronunciationAudio } from './pronunciationAudio'
import { Radical } from './radical'
import { Reading, ReadingType } from './reading'
import { Vocabulary } from './vocabulary'

export type Subject = Radical | Kanji | Vocabulary | KanaVocabulary
export type SubjectType = Subject['type']

/**
 * Represents a subject in the WaniKani system.
 */
export interface SubjectBase {
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
  created_at: number

  /**
   * Timestamp when the subject was hidden.
   * If hidden, associated assignments will no longer appear in lessons or reviews,
   * and the subject page will no longer be visible on wanikani.com.
   */
  hidden_at: number | null

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
  export const getPrimaryMeaning = (
    subject: SubjectBase,
  ): Meaning | undefined => subject.meanings.find(el => el.primary)
  export const getOtherMeaning = (subject: SubjectBase): Meaning[] =>
    subject.meanings.filter(el => !el.primary)

  export const getPrimaryReadings = (subject: Kanji | Vocabulary): Reading[] =>
    subject.readings.filter(el => el.primary)

  export const getReadingsByType = (
    subject: Kanji | Vocabulary,
  ): Record<ReadingType, Reading[]> => {
    const readingsByType: Record<ReadingType, Reading[]> = {
      kunyomi: [],
      onyomi: [],
      nanori: [],
    }
    subject.readings.forEach(reading => {
      const type = reading.type
      if (!type) {
        console.warn('Reading type is missing', reading)
        return
      }
      readingsByType[type].push(reading)
    })
    return readingsByType
  }

  export const getPrononciationAudioForReading = (
    subject: Vocabulary | KanaVocabulary,
    reading: Reading,
  ): PronunciationAudio[] =>
    subject.pronunciation_audios.filter(
      el => el.metadata.pronunciation === reading.reading,
    )

  export const getSubjectName = (subject: Subject) =>
    StringUtils.capitalizeFirstLetter(subject.type.toString()).split('_')[0]

  export const getPrimaryReadingType = (subject: Kanji) =>
    subject.readings.find(el => el.primary)?.type

  export const compareByLevelAndLessonPosition = (a: Subject, b: Subject) => {
    if (a.level !== b.level) {
      return a.level - b.level
    }
    return a.lesson_position - b.lesson_position
  }

  export function isRadical(subject: Subject | undefined): subject is Radical {
    return subject?.type === 'radical'
  }
  export function isKanji(subject: Subject | undefined): subject is Kanji {
    return subject?.type === 'kanji'
  }
  export function isVocabulary(
    subject: Subject | undefined,
  ): subject is Vocabulary {
    return subject?.type === 'vocabulary'
  }
  export function isKanaVocabulary(
    subject: Subject | undefined,
  ): subject is KanaVocabulary {
    return subject?.type === 'kana_vocabulary'
  }

  export function hasReading(subject: Subject): subject is Kanji | Vocabulary {
    return isKanji(subject) || isVocabulary(subject)
  }

  export function map<T>(
    subject: Subject,
    mapping: Record<Subject['type'], T>,
  ): T {
    return mapping[subject.type]
  }

  export function getAssociatedColor(subject: Subject): string {
    return map(subject, {
      kana_vocabulary: Colors.purple,
      vocabulary: Colors.purple,
      kanji: Colors.pink,
      radical: Colors.blue,
    })
  }
}
