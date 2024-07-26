import { useCallback, useEffect, useMemo, useState } from 'react'
import { asyncStorageHelper } from '../utils/asyncStorageHelper'
import { useAsyncFetch } from './useAsyncFetch'
import { wanikaniApi } from '../api/wanikaniApi'
import { useSQLiteContext } from 'expo-sqlite'
import { dbHelper } from '../utils/dbHelper'

const timeDiffTrigger = 1000 * 60 * 60 * 24 // 24 hours

export const useDbHydrator = (enabled: boolean) => {
  const [subjectsFetched, setSubjectsFetched] = useState<number>(0)
  const [subjectsTotalCount, setSubjectsTotalCount] = useState<
    number | undefined
  >(undefined)
  const [lastSubjectId, setLastSubjectId] = useState<number | undefined>(
    undefined,
  )
  const [updateStart, setUpdateStart] = useState<Date | undefined>(undefined)

  const fetchLastUpdate = useCallback(
    () => asyncStorageHelper.getSubjectsLastUpdate(),
    [],
  )

  const lastUpdate = useAsyncFetch(undefined, fetchLastUpdate)

  const shouldLoad = useMemo(() => {
    if (!enabled) return false
    if (lastUpdate.isLoading) return false
    if (!shouldTrigger(lastUpdate.data)) return false

    console.log('[useDbHydrator] shouldLoad:', true)
    setUpdateStart(new Date())
    return true
  }, [lastUpdate.isLoading, lastUpdate.data, enabled])

  const { data: apiSubjectsData, isLoading: apiIsLoading } =
    wanikaniApi.useGetSubjectsQuery(
      { updatedAfter: lastUpdate.data, pageAfterId: lastSubjectId },
      { skip: !shouldLoad },
    )

  useEffect(() => {
    if (apiSubjectsData) {
      setSubjectsTotalCount(apiSubjectsData?.totalCount)
    }
  }, [apiSubjectsData])

  const subjects = useMemo(() => {
    if (!shouldLoad) return []

    return apiSubjectsData?.data ?? []
  }, [shouldLoad, apiSubjectsData])

  const db = useSQLiteContext()

  useEffect(() => {
    if (subjects.length > 0) {
      setSubjectsFetched(prev => prev + subjects.length)
      setLastSubjectId(subjects[subjects.length - 1].id)
    }
  }, [subjects])

  useEffect(() => {
    if (subjects.length > 0) {
      dbHelper.saveSubjects(db, subjects)
    }
  }, [subjects, db])

  useEffect(() => {
    if (
      shouldLoad &&
      updateStart &&
      !apiIsLoading &&
      !apiSubjectsData?.hasMore
    ) {
      asyncStorageHelper.setSubjectsLastUpdate(updateStart.toISOString())
    }
  }, [shouldLoad, updateStart, apiIsLoading, apiSubjectsData?.hasMore])

  const isLoading = useMemo(() => {
    return (
      apiIsLoading || apiSubjectsData?.hasMore === true || lastUpdate.isLoading
    )
  }, [apiIsLoading, apiSubjectsData, lastUpdate.isLoading])

  const progress = useMemo(() => {
    if (!shouldLoad || !subjectsTotalCount) return 0

    return subjectsFetched / subjectsTotalCount
  }, [shouldLoad, subjectsFetched, subjectsTotalCount])

  return { isLoading, progress, subjectsTotalCount, subjectsFetched }
}

const shouldTrigger = (lastUpdate: string | null | undefined) => {
  if (!lastUpdate) return true

  const lastUpdateDate = new Date(lastUpdate)
  const now = new Date()
  const diff = now.getTime() - lastUpdateDate.getTime()
  return diff >= timeDiffTrigger
}
