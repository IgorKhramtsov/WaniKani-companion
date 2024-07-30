import { Subject } from '../types/subject'
import { SQLiteDatabase } from 'expo-sqlite'

const createTable = async (db: SQLiteDatabase) => {
  await db.runAsync(
    'CREATE TABLE IF NOT EXISTS subjects (id INTEGER PRIMARY KEY, data TEXT)',
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
        'INSERT OR REPLACE INTO subjects (id, data) VALUES',
        Array(subjects.length).fill('(?, ?)').join(', '),
      ].join(' '),
      subjects.flatMap(s => [s.id, JSON.stringify(s)]),
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

const resetDb = async (db: SQLiteDatabase) => {
  await db.withExclusiveTransactionAsync(async txn => {
    txn.runAsync('DROP TABLE IF EXISTS subjects')
  })
}

export const dbHelper = {
  createTable,
  saveSubject,
  saveSubjects,
  getSubject,
  getSubjects,
  getAllSubjects,
  resetDb,
}

export {
  createTable,
  saveSubject,
  saveSubjects,
  getSubject,
  getSubjects,
  getAllSubjects,
  resetDb,
}
