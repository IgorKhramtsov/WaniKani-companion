import { SQLiteDatabase } from 'expo-sqlite'

const createTables = async (db: SQLiteDatabase) => {
  await db.runAsync(
    `CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY,
      data TEXT,
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
      data TEXT,
      subject_id UNSIGNED SMALLINT NOT NULL
    )`,
  )
  await db.runAsync(
    `CREATE TABLE IF NOT EXISTS review_statistics (
      id INTEGER PRIMARY KEY,
      data TEXT,
      subject_id UNSIGNED SMALLINT NOT NULL
    )`,
  )
}

const resetDb = async (db: SQLiteDatabase) => {
  try {
    await db.withExclusiveTransactionAsync(async txn => {
      await txn.runAsync('DROP TABLE IF EXISTS subjects')
      await txn.runAsync('DROP TABLE IF EXISTS assignments')
      await txn.runAsync('DROP TABLE IF EXISTS review_statistics')
    })
  } catch (e) {
    console.error('Failed to reset db', e)
  }
}

export const dbHelper = {
  createTables,
  resetDb,
}
