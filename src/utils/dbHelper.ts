import { SQLiteDatabase } from 'expo-sqlite'

const resetDb = async (db: SQLiteDatabase) => {
  try {
    await db.withExclusiveTransactionAsync(async txn => {
      const tables = await txn.getAllAsync<{ name: string }>(
        'SELECT name FROM sqlite_master WHERE type="table"',
      )
      console.log('Dropping tables', tables)
      for (const { name: table } of tables) {
        console.log('Dropping table', table)
        await txn.runAsync(`DROP TABLE IF EXISTS ${table}`)
      }
    })
  } catch (e) {
    console.error('Failed to reset db', e)
  }
}

export const dbHelper = {
  resetDb,
}
