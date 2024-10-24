import { text, int, sqliteTable } from 'drizzle-orm/sqlite-core'
import { AuxiliaryMeaning } from '../types/auxiliaryMeaning'
import { Meaning } from '../types/meaning'
import { CharacterImage } from '../types/characterImage'
import { Reading } from '../types/reading'
import { ContextSentence } from '../types/contextSentence'
import { PronunciationAudio } from '../types/pronunciationAudio'

export const subjectsTable = sqliteTable('subjects', {
  id: int().primaryKey(),
  type: text().notNull(),
  auxiliary_meanings: text({ mode: 'json' })
    .$type<AuxiliaryMeaning>()
    .notNull(),
  characters: text(),
  created_at: int().notNull(),
  hidden_at: int(),
  lesson_position: int().notNull(),
  level: int().notNull(),
  meaning_mnemonic: text().notNull(),
  meanings: text({ mode: 'json' }).$type<Meaning[]>().default([]),
  slug: text().notNull(),
  spaced_repetition_system_id: int().notNull(),
  // Radical, Kanji
  amalgamation_subject_ids: text({ mode: 'json' })
    .$type<number[]>()
    .default([]),
  // Kanji, Vocabulary
  component_subject_ids: text({ mode: 'json' }).$type<number[]>().default([]),
  reading_mnemonic: text(),
  readings: text({ mode: 'json' }).$type<Reading[]>().default([]),
  // Radical
  character_images: text({ mode: 'json' })
    .$type<CharacterImage[]>()
    .default([]),
  // Kanji
  meaning_hint: text(),
  reading_hint: text(),
  visually_similar_subject_ids: text({ mode: 'json' })
    .$type<number[]>()
    .default([]),
  // Vocabulary, KanaVocabulary
  context_sentences: text({ mode: 'json' })
    .$type<ContextSentence[]>()
    .default([]),
  parts_of_speech: text({ mode: 'json' }).$type<string[]>().default([]),
  pronunciation_audios: text({ mode: 'json' })
    .$type<PronunciationAudio[]>()
    .default([]),
})

export const assignmentsTable = sqliteTable('assignments', {
  id: int().primaryKey(),
  updated_at: int().notNull(),
  available_at: int(),
  burned_at: int(),
  created_at: int().notNull(),
  hidden: int({ mode: 'boolean' }).notNull(),
  passed_at: int(),
  resurrected_at: int(),
  srs_stage: int().notNull(),
  started_at: int(),
  subject_id: int().notNull(),
  subject_type: text().notNull(),
  unlocked_at: int(),
})

export const reviewStatisticsTable = sqliteTable('review_statistics', {
  id: int().primaryKey(),
  created_at: int().notNull(),
  hidden: int({ mode: 'boolean' }).notNull(),
  meaning_correct: int().notNull(),
  meaning_current_streak: int().notNull(),
  meaning_incorrect: int().notNull(),
  meaning_max_streak: int().notNull(),
  percentage_correct: int().notNull(),
  reading_correct: int().notNull(),
  reading_current_streak: int().notNull(),
  reading_incorrect: int().notNull(),
  reading_max_streak: int().notNull(),
  subject_id: int().notNull(),
  subject_type: text().notNull(),
})

export const reviewsTable = sqliteTable('reviews', {
  id: int().primaryKey(),
  assignment_id: int().notNull(),
  created_at: int().notNull(),
  ending_srs_stage: int().notNull(),
  incorrect_meaning_answers: int().notNull(),
  incorrect_reading_answers: int().notNull(),
  spaced_repetition_system_id: int().notNull(),
  starting_srs_stage: int().notNull(),
  subject_id: int().notNull(),
})

export const levelProgressionsTable = sqliteTable('level_progressions', {
  id: int().primaryKey(),
  created_at: int().notNull(),
  level: int().notNull(),
  unlocked_at: int(),
  started_at: int(),
  passed_at: int(),
  completed_at: int(),
  abandoned_at: int(),
})

export const studyMaterialsTable = sqliteTable('study_materials', {
  id: int().primaryKey(),
  created_at: int().notNull(),
  hidden: int({ mode: 'boolean' }),
  meaning_note: text(),
  meaning_synonyms: text({ mode: 'json' }).$type<string[]>().default([]),
  reading_note: text(),
  subject_id: int().notNull(),
  subject_type: text().notNull(),
})
