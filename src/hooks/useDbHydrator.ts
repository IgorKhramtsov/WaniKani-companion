import { useCallback, useEffect, useMemo, useState } from 'react'
import { asyncStorageHelper } from '../utils/asyncStorageHelper'
import { useAsyncFetch } from './useAsyncFetch'
import { wanikaniApi } from '../api/wanikaniApi'
import {
  useSaveLevelProgressionsMutation,
  useSaveReviewStatisticsMutation,
  useSaveStudyMaterialsMutation,
} from '../api/localDb/api'
import { useDispatch } from 'react-redux'
import { useSaveSubjectsMutation } from '../api/localDb/subject'
import { useSaveAssignmentsMutation } from '../api/localDb/assignment'

const timeDiffTrigger = 1000 * 60 * 60 * 24 // 24 hours

// TODO: try to abstract fetch logic instead of duplicating it for every
// endpoint (after TanStack Query migration)
export const useDbHydrator = (enabled: boolean) => {
  const dispatch = useDispatch()
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
  const [levelProgressionsTotalCount, setLevelProgressionsTotalCount] =
    useState<number | undefined>(undefined)
  const [studyMaterialsTotalCount, setStudyMaterialsTotalCount] = useState<
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
  const [studyMaterialIdToFetchAfter, setStudyMaterialIdToFetchAfter] =
    useState<number | undefined>(undefined)
  const [updateStart, setUpdateStart] = useState<Date | undefined>(undefined)
  const [manualTrigger, setManualTrigger] = useState<boolean>(false)

  const triggerUpdate = useCallback(() => {
    setManualTrigger(true)
    dispatch(
      wanikaniApi.util.invalidateTags([
        'Reviews',
        'Lessons',
        'Assignment',
        'ReviewStatistic',
        'Subject',
        'User',
        'LevelProgressions',
        'StudyMaterials',
      ]),
    )
  }, [dispatch, setManualTrigger])

  const lastUpdate = useAsyncFetch(() => asyncStorageHelper.getLastUpdateTime())
  const shouldLoad = useMemo(() => {
    if (!enabled) return false
    if (lastUpdate.isLoading) return false
    if (!manualTrigger && !shouldTrigger(lastUpdate.data)) return false

    console.log('[useDbHydrator] shouldLoad:', true)
    setUpdateStart(new Date())
    return true
  }, [manualTrigger, lastUpdate.isLoading, lastUpdate.data, enabled])

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
  const {
    data: apiLevelProgressionsData,
    isLoading: apiLevelProgressionsIsLoading,
  } = wanikaniApi.useGetLevelProgressionsQuery(
    { updatedAfter: lastUpdate.data },
    { skip: !shouldLoad },
  )
  const { data: apiStudyMaterialsData, isLoading: apiStudyMaterialsIsLoading } =
    wanikaniApi.useGetStudyMaterialsQuery(
      {
        updatedAfter: lastUpdate.data,
        pageAfterId: studyMaterialIdToFetchAfter,
      },
      { skip: !shouldLoad },
    )

  const [saveSubjects] = useSaveSubjectsMutation()
  const [saveAssignments] = useSaveAssignmentsMutation()
  const [saveReviewStatistics] = useSaveReviewStatisticsMutation()
  const [saveLevelProgressions] = useSaveLevelProgressionsMutation()
  const [saveStudyMaterials] = useSaveStudyMaterialsMutation()

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

  useEffect(() => {
    if (apiLevelProgressionsData) {
      setLevelProgressionsTotalCount(apiLevelProgressionsData?.totalCount)
    }
  }, [apiLevelProgressionsData])

  useEffect(() => {
    if (apiStudyMaterialsData) {
      setStudyMaterialsTotalCount(apiStudyMaterialsData?.totalCount)
    }
  }, [apiStudyMaterialsData])

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

  const levelProgressions = useMemo(() => {
    if (!shouldLoad) return []

    return apiLevelProgressionsData?.data ?? []
  }, [shouldLoad, apiLevelProgressionsData])

  const studyMaterials = useMemo(() => {
    if (!shouldLoad) return []

    return apiStudyMaterialsData?.data ?? []
  }, [shouldLoad, apiStudyMaterialsData])

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
    if (levelProgressions.length > 0) {
      setObjectsFetched(prev => prev + levelProgressions.length)
    }
  }, [levelProgressions])

  useEffect(() => {
    if (studyMaterials.length > 0) {
      setObjectsFetched(prev => prev + studyMaterials.length)
      if (apiStudyMaterialsData?.hasMore) {
        setStudyMaterialIdToFetchAfter(
          studyMaterials[studyMaterials.length - 1].id,
        )
      }
    }
  }, [studyMaterials, apiStudyMaterialsData?.hasMore])

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
    if (levelProgressions.length > 0) {
      saveLevelProgressions(levelProgressions)
    }
  }, [saveLevelProgressions, levelProgressions])

  useEffect(() => {
    if (studyMaterials.length > 0) {
      saveStudyMaterials(studyMaterials)
    }
  }, [saveStudyMaterials, studyMaterials])

  useEffect(() => {
    if (
      shouldLoad &&
      updateStart &&
      !apiSubjectsIsLoading &&
      !apiAssignmentsIsLoading &&
      !apiLevelProgressionsIsLoading &&
      !apiStudyMaterialsIsLoading &&
      !apiSubjectsData?.hasMore &&
      !apiAssignmentsData?.hasMore &&
      !apiReviewStatisticsData?.hasMore &&
      !apiStudyMaterialsData?.hasMore
    ) {
      setManualTrigger(false)
      asyncStorageHelper.setLastUpdateTime(updateStart.toISOString())
      setUpdateStart(undefined)
      setObjectsFetched(0)
      setSubjectsTotalCount(undefined)
      setAssignmentsTotalCount(undefined)
      setReviewStatisticsTotalCount(undefined)
      setLevelProgressionsTotalCount(undefined)
      setStudyMaterialsTotalCount(undefined)
    }
  }, [
    setManualTrigger,
    shouldLoad,
    updateStart,
    apiSubjectsIsLoading,
    apiAssignmentsIsLoading,
    apiLevelProgressionsIsLoading,
    apiStudyMaterialsIsLoading,
    apiSubjectsData?.hasMore,
    apiAssignmentsData?.hasMore,
    apiReviewStatisticsData?.hasMore,
    apiStudyMaterialsData?.hasMore,
  ])

  const isLoading = useMemo(() => {
    return (
      apiSubjectsIsLoading ||
      apiAssignmentsIsLoading ||
      apiReviewStatisticsIsLoading ||
      apiLevelProgressionsIsLoading ||
      apiStudyMaterialsIsLoading ||
      apiSubjectsData?.hasMore === true ||
      apiAssignmentsData?.hasMore === true ||
      apiReviewStatisticsData?.hasMore === true ||
      lastUpdate.isLoading ||
      apiStudyMaterialsData?.hasMore === true
    )
  }, [
    apiAssignmentsData?.hasMore,
    apiAssignmentsIsLoading,
    apiReviewStatisticsData?.hasMore,
    apiReviewStatisticsIsLoading,
    apiSubjectsData?.hasMore,
    apiSubjectsIsLoading,
    apiLevelProgressionsIsLoading,
    apiStudyMaterialsIsLoading,
    apiStudyMaterialsData?.hasMore,
    lastUpdate.isLoading,
  ])

  const total = useMemo(
    () =>
      (subjectsTotalCount ?? 0) +
      (assignmentsTotalCount ?? 0) +
      (reviewStatisticsTotalCount ?? 0) +
      (levelProgressionsTotalCount ?? 0) +
      (studyMaterialsTotalCount ?? 0),
    [
      subjectsTotalCount,
      assignmentsTotalCount,
      reviewStatisticsTotalCount,
      levelProgressionsTotalCount,
      studyMaterialsTotalCount,
    ],
  )

  const progress = useMemo(() => {
    if (!shouldLoad || total === 0) return 0

    return objectsFetched / total
  }, [shouldLoad, objectsFetched, total])

  return {
    triggerUpdate,
    isLoading,
    progress,
    totalCount: total,
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
