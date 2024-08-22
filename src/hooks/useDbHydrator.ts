import { useEffect, useMemo, useState } from 'react'
import { asyncStorageHelper } from '../utils/asyncStorageHelper'
import { useAsyncFetch } from './useAsyncFetch'
import { wanikaniApi } from '../api/wanikaniApi'
import {
  useSaveAssignmentsMutation,
  useSaveReviewStatisticsMutation,
  useSaveSubjectsMutation,
} from '../api/localDbApi'

const timeDiffTrigger = 1000 * 60 * 60 * 24 // 24 hours

// TODO: try to abstract fetch logic instead of duplicating it for every
// endpoint (after TanStack Query migration)
export const useDbHydrator = (enabled: boolean) => {
  const [objectsFetched, setObjectsFetched] = useState<number>(0)
  const [subjectsTotalCount, setSubjectsTotalCount] = useState<
    number | undefined
  >(undefined)
  const [assignmentsTotalCount, setAssignmentsTotalCount] = useState<
    number | undefined
  >(undefined)
  const [reviewStatisticsTotalCount, setReviewStatisticsTotalCount] = useState<
    number | undefined
  >(undefined)
  const [subjectIdToFetchAfter, setSubjectIdToFetchAfter] = useState<
    number | undefined
  >(undefined)
  const [assignmentIdToFetchAfter, setAssignmentIdToFetchAfter] = useState<
    number | undefined
  >(undefined)
  const [reviewStatisticIdToFetchAfter, setReviewStatisticIdToFetchAfter] =
    useState<number | undefined>(undefined)
  const [updateStart, setUpdateStart] = useState<Date | undefined>(undefined)

  const lastUpdate = useAsyncFetch(() => asyncStorageHelper.getLastUpdateTime())
  const shouldLoad = useMemo(() => {
    if (!enabled) return false
    if (lastUpdate.isLoading) return false
    if (!shouldTrigger(lastUpdate.data)) return false

    console.log('[useDbHydrator] shouldLoad:', true)
    setUpdateStart(new Date())
    return true
  }, [lastUpdate.isLoading, lastUpdate.data, enabled])

  const { data: apiSubjectsData, isLoading: apiSubjectsIsLoading } =
    wanikaniApi.useGetSubjectsQuery(
      { updatedAfter: lastUpdate.data, pageAfterId: subjectIdToFetchAfter },
      { skip: !shouldLoad },
    )
  const { data: apiAssignmentsData, isLoading: apiAssignmentsIsLoading } =
    wanikaniApi.useGetAssignmentsQuery(
      { updatedAfter: lastUpdate.data, pageAfterId: assignmentIdToFetchAfter },
      { skip: !shouldLoad },
    )
  const {
    data: apiReviewStatisticsData,
    isLoading: apiReviewStatisticsIsLoading,
  } = wanikaniApi.useGetReviewStatisticsQuery(
    {
      updatedAfter: lastUpdate.data,
      pageAfterId: reviewStatisticIdToFetchAfter,
    },
    { skip: !shouldLoad },
  )

  const [saveSubjects] = useSaveSubjectsMutation()
  const [saveAssignments] = useSaveAssignmentsMutation()
  const [saveReviewStatistics] = useSaveReviewStatisticsMutation()

  useEffect(() => {
    if (apiSubjectsData) {
      setSubjectsTotalCount(apiSubjectsData?.totalCount)
    }
  }, [apiSubjectsData])

  useEffect(() => {
    if (apiAssignmentsData) {
      setAssignmentsTotalCount(apiAssignmentsData?.totalCount)
    }
  }, [apiAssignmentsData])

  useEffect(() => {
    if (apiReviewStatisticsData) {
      setReviewStatisticsTotalCount(apiReviewStatisticsData?.totalCount)
    }
  }, [apiReviewStatisticsData])

  const subjects = useMemo(() => {
    if (!shouldLoad) return []

    return apiSubjectsData?.data ?? []
  }, [shouldLoad, apiSubjectsData])

  const assignments = useMemo(() => {
    if (!shouldLoad) return []

    return apiAssignmentsData?.data ?? []
  }, [shouldLoad, apiAssignmentsData])

  const reviewStatistics = useMemo(() => {
    if (!shouldLoad) return []

    return apiReviewStatisticsData?.data ?? []
  }, [shouldLoad, apiReviewStatisticsData])

  useEffect(() => {
    if (subjects.length > 0) {
      setObjectsFetched(prev => prev + subjects.length)
      if (apiSubjectsData?.hasMore) {
        setSubjectIdToFetchAfter(subjects[subjects.length - 1].id)
      }
    }
  }, [subjects, apiSubjectsData?.hasMore])

  useEffect(() => {
    if (assignments.length > 0) {
      setObjectsFetched(prev => prev + assignments.length)
      if (apiAssignmentsData?.hasMore) {
        setAssignmentIdToFetchAfter(assignments[assignments.length - 1].id)
      }
    }
  }, [assignments, apiAssignmentsData?.hasMore])

  useEffect(() => {
    if (reviewStatistics.length > 0) {
      setObjectsFetched(prev => prev + reviewStatistics.length)
      if (apiAssignmentsData?.hasMore) {
        setReviewStatisticIdToFetchAfter(
          reviewStatistics[reviewStatistics.length - 1].id,
        )
      }
    }
  }, [reviewStatistics, apiAssignmentsData?.hasMore])

  useEffect(() => {
    if (subjects.length > 0) {
      saveSubjects(subjects)
    }
  }, [saveSubjects, subjects])

  useEffect(() => {
    if (assignments.length > 0) {
      saveAssignments(assignments)
    }
  }, [saveAssignments, assignments])

  useEffect(() => {
    if (reviewStatistics.length > 0) {
      saveReviewStatistics(reviewStatistics)
    }
  }, [saveReviewStatistics, reviewStatistics])

  useEffect(() => {
    if (
      shouldLoad &&
      updateStart &&
      !apiSubjectsIsLoading &&
      !apiAssignmentsIsLoading &&
      !apiSubjectsData?.hasMore &&
      !apiAssignmentsData?.hasMore &&
      !apiReviewStatisticsData?.hasMore
    ) {
      asyncStorageHelper.setLastUpdateTime(updateStart.toISOString())
      setUpdateStart(undefined)
      setObjectsFetched(0)
      setSubjectsTotalCount(undefined)
      setAssignmentsTotalCount(undefined)
      setReviewStatisticsTotalCount(undefined)
    }
  }, [
    shouldLoad,
    updateStart,
    apiSubjectsIsLoading,
    apiAssignmentsIsLoading,
    apiSubjectsData?.hasMore,
    apiAssignmentsData?.hasMore,
    apiReviewStatisticsData?.hasMore,
  ])

  const isLoading = useMemo(() => {
    return (
      apiSubjectsIsLoading ||
      apiAssignmentsIsLoading ||
      apiReviewStatisticsIsLoading ||
      apiSubjectsData?.hasMore === true ||
      apiAssignmentsData?.hasMore === true ||
      apiReviewStatisticsData?.hasMore === true ||
      lastUpdate.isLoading
    )
  }, [
    apiAssignmentsData?.hasMore,
    apiAssignmentsIsLoading,
    apiReviewStatisticsData?.hasMore,
    apiReviewStatisticsIsLoading,
    apiSubjectsData?.hasMore,
    apiSubjectsIsLoading,
    lastUpdate.isLoading,
  ])

  const progress = useMemo(() => {
    if (
      !shouldLoad ||
      (!subjectsTotalCount &&
        !assignmentsTotalCount &&
        !reviewStatisticsTotalCount)
    )
      return 0

    const total =
      (subjectsTotalCount ?? 0) +
      (assignmentsTotalCount ?? 0) +
      (reviewStatisticsTotalCount ?? 0)

    if (total === 0) return 0 // Just in case
    return objectsFetched / total
  }, [
    shouldLoad,
    objectsFetched,
    subjectsTotalCount,
    assignmentsTotalCount,
    reviewStatisticsTotalCount,
  ])

  return {
    isLoading,
    progress,
    totalCount:
      (subjectsTotalCount ?? 0) +
      (assignmentsTotalCount ?? 0) +
      (reviewStatisticsTotalCount ?? 0),
    objectsFetched: objectsFetched,
  }
}

const shouldTrigger = (lastUpdate: string | null | undefined) => {
  if (!lastUpdate) return true

  const lastUpdateDate = new Date(lastUpdate)
  const now = new Date()
  const diff = now.getTime() - lastUpdateDate.getTime()
  return diff >= timeDiffTrigger
}
