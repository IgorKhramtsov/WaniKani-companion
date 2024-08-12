import { useSQLiteContext } from 'expo-sqlite'
import { Subject } from '../types/subject'
import { dbHelper } from '../utils/dbHelper'
import { useAsyncFetch } from './useAsyncFetch'
import { useCallback, useEffect } from 'react'

type Result = {
  subjects: Subject[]
  isLoading: boolean
}

export const useSubjectSearch = (query: string): Result => {
  const db = useSQLiteContext()

  const fetchFunc = useCallback(
    () => dbHelper.searchSubjects(db, query),
    [db, query],
  )
  const { isLoading, data } = useAsyncFetch(fetchFunc)

  return {
    subjects: data ?? [],
    isLoading,
  }
}
