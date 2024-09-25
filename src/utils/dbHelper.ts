import { SQLiteDatabase } from 'expo-sqlite'

const createTables = async (db: SQLiteDatabase) => {
  await db.runAsync(
    `CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY,
      data TEXT NOT NULL,
      level UNSIGNED TINYINT NOT NULL,
      type TEXT NOT NULL,
      meanings TEXT NOT NULL,
      readings TEXT,
      meaning_mnemonic TEXT NOT NULL,
      reading_mnemonic TEXT,
      characters TEXT
    )`,
  )
  await db.runAsync(
    `CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY,
      data TEXT NOT NULL,
      subject_id UNSIGNED SMALLINT NOT NULL,
      available_at UNSIGNED INT NOT NULL,
      srs_stage UNSIGNED TINYINT NOT NULL
    )`,
  )
  await db.runAsync(
    `CREATE TABLE IF NOT EXISTS review_statistics (
      id INTEGER PRIMARY KEY,
      data TEXT NOT NULL,
      subject_id UNSIGNED SMALLINT NOT NULL
    )`,
  )
  await db.runAsync(
    `CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY,
      data TEXT NOT NULL,
      created_at UNSIGNED INT NOT NULL,
      subject_id UNSIGNED SMALLINT NOT NULL
    )`,
  )
  await db.runAsync(
    `CREATE TABLE IF NOT EXISTS level_progressions (
      id INTEGER PRIMARY KEY,
      data TEXT NOT NULL,
      created_at UNSIGNED INT NOT NULL,
      level UNSIGNED TINYINT NOT NULL,
      unlocked_at UNSIGNED INT,
      started_at UNSIGNED INT,
      passed_at UNSIGNED INT,
      completed_at UNSIGNED INT,
      abandoned_at UNSIGNED INT
    )`,
  )
}

const resetDb = async (db: SQLiteDatabase) => {
  try {
    await db.withExclusiveTransactionAsync(async txn => {
      await txn.runAsync('DROP TABLE IF EXISTS subjects')
      await txn.runAsync('DROP TABLE IF EXISTS assignments')
      await txn.runAsync('DROP TABLE IF EXISTS review_statistics')
      await txn.runAsync('DROP TABLE IF EXISTS reviews')
      await txn.runAsync('DROP TABLE IF EXISTS level_progressions')
    })
  } catch (e) {
    console.error('Failed to reset db', e)
  }
}

export const dbHelper = {
  createTables,
  resetDb,
}
