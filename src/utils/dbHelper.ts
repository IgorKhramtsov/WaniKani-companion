import { Subject, SubjectUtils } from '../types/subject'
import { SQLiteDatabase } from 'expo-sqlite'
import wanakana from 'wanakana'

const createTable = async (db: SQLiteDatabase) => {
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
}

const saveSubject = async (db: SQLiteDatabase, subject: Subject) => {
  const { id } = subject
  const data = JSON.stringify(subject)
  await db.runAsync(
    'INSERT OR REPLACE INTO subjects (id, data) VALUES (?, ?)',
    [id, data],
  )
}

const saveSubjects = async (db: SQLiteDatabase, subjects: Subject[]) => {
  try {
    await db.runAsync(
      [
        `INSERT OR REPLACE INTO subjects (
          id, 
          data,
          meanings,
          readings,
          meaning_mnemonic,
          reading_mnemonic,
          characters
        ) VALUES`,
        Array(subjects.length).fill('(?, ?, ?, ?, ?, ?, ?)').join(', '),
      ].join(' '),
      subjects.flatMap(s => [
        s.id,
        JSON.stringify(s),
        s.meanings.map(e => e.meaning).join(','),
        SubjectUtils.hasReading(s)
          ? s.readings.map(e => e.reading).join(',')
          : null,
        s.meaning_mnemonic,
        SubjectUtils.hasReading(s) ? s.reading_mnemonic : null,
        s.characters,
      ]),
    )
  } catch (e) {
    console.error('Failed to save subjects. ', e)
  }
}

const getSubject = async (
  db: SQLiteDatabase,
  id: number,
): Promise<Subject | undefined> => {
  const result = await db.getFirstAsync<{ data: string }>(
    'SELECT data FROM subjects WHERE id = ?',
    [id],
  )
  if (result?.data) {
    return JSON.parse(result.data)
  }
}

const getSubjects = async (
  db: SQLiteDatabase,
  ids: number[],
): Promise<Subject[]> => {
  if (ids.length === 0) {
    console.log('[dbHelper] getSubjects: empty ids')
    return []
  }
  const result = await db.getAllAsync<{ data: string }>(
    `SELECT data FROM subjects WHERE id IN (${ids.map(() => '?').join(', ')})`,
    ids,
  )
  console.log('[dbHelper] getSubjects args:', ids.join(', '))
  console.log('[dbHelper] getSubjects for', ids, 'result len:', result.length)
  return result.map(row => JSON.parse(row.data))
}

const getAllSubjects = async (db: SQLiteDatabase): Promise<Subject[]> => {
  const rows = await db.getAllAsync<{ data: string }>(
    'SELECT data FROM subjects',
  )
  const subjects: Subject[] = []
  for (const row of rows) {
    subjects.push(JSON.parse(row.data))
  }
  return subjects
}

const searchSubjects = async (
  db: SQLiteDatabase,
  query: string,
): Promise<Subject[]> => {
  const queryJp = wanakana.toHiragana(query, { IMEMode: 'toHiragana' })
  try {
    // TODO: mnemonic search should show snippet of the found entry. This might
    // result in a lot of results. We could experiment with ranking, for that
    // the sqlite's FTS might be useful(https://www.youtube.com/watch?v=eXMA_2dEMO0)
    //
    // LOWER(meaning_mnemonic) LIKE ? OR
    // LOWER(reading_mnemonic) LIKE ? OR
    // `%${query}%`,
    // `%${query}%`,
    const results = await db.getAllAsync<{ data: string }>(
      `SELECT data FROM subjects WHERE 
        (',' || LOWER(meanings) || ',') LIKE ? OR 
        (',' || LOWER(readings) || ',') LIKE ? OR 
        characters LIKE ?
        LIMIT 50
`,
      [`%,%${query}%,%`, `%,%${queryJp}%,%`, `%${queryJp}%`],
    )
    return results.map(row => JSON.parse(row.data))
  } catch (e) {
    console.error('Failed to search subjects. ', e)
  }
  return []
}

const resetDb = async (db: SQLiteDatabase) => {
  try {
    await db.withExclusiveTransactionAsync(async txn => {
      await txn.runAsync('DROP TABLE IF EXISTS subjects')
    })
  } catch (e) {
    console.error('Failed to reset db', e)
  }
}

export const dbHelper = {
  createTable,
  saveSubject,
  saveSubjects,
  getSubject,
  getSubjects,
  getAllSubjects,
  searchSubjects,
  resetDb,
}

export {
  createTable,
  saveSubject,
  saveSubjects,
  getSubject,
  getSubjects,
  getAllSubjects,
  searchSubjects,
  resetDb,
}
