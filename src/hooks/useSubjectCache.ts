import { useCallback, useEffect, useMemo } from 'react'
import { Subject, SubjectUtils } from '../types/subject'
import { selectSubjects, subjectsReceived } from '../redux/subjectsSlice'
import { useAppDispatch, useAppSelector } from './redux'
import _ from 'lodash'
import { useSQLiteContext } from 'expo-sqlite'
import { getSubjects } from '../utils/dbHelper'
import { useAsyncFetch } from './useAsyncFetch'

type Result = {
  subjects: Subject[]
  isLoading: boolean
}

const useFetchSubjectsAndHydrate_v2 = (
  subjectIds: number[] | undefined,
): Result => {
  const dispatch = useAppDispatch()
  const subjectIdsSafe = useMemo(() => {
    return _.uniq(subjectIds ?? [])
  }, [subjectIds])
  console.log(
    '[useSubjectCache_hydrate] hydrate:',
    subjectIdsSafe.slice(0, 3),
    subjectIdsSafe.length,
  )

  const subjects = useAppSelector(selectSubjects(subjectIdsSafe))

  useEffect(() => {
    console.log('[useSubjectCache_hydrate] hydrate useEffect: subjects')
  }, [subjects])

  useEffect(() => {
    console.log('[useSubjectCache_hydrate] hydrate useEffect: subjectIdsSafe')
  }, [subjectIdsSafe])

  const sliceMissingIds = useMemo(() => {
    console.log('[useSubjectCache_hydrate] useMemo: sliceMissingIds')
    const ids = subjectIdsSafe.filter(id => !subjects.some(el => el.id === id))
    if (ids.length > 0) {
      console.log('[useSubjectCache_hydrate] slice missing ids:', ids)
    }
    return ids
  }, [subjectIdsSafe, subjects])

  useEffect(() => {
    console.log('[useSubjectCache_hydrate] useEffect: sliceMissingIds')
  }, [sliceMissingIds])

  const db = useSQLiteContext()
  const fetchFunc = useCallback(
    () => getSubjects(db, sliceMissingIds),
    [db, sliceMissingIds],
  )

  useEffect(() => {
    console.log('[useSubjectCache_hydrate] useEffect: fetchFunc')
  }, [fetchFunc])

  const { data: dbSubjects, isLoading: dbIsLoading } = useAsyncFetch(
    fetchFunc,
    sliceMissingIds.length === 0,
  )

  useEffect(() => {
    if (dbIsLoading) return

    if (dbSubjects && dbSubjects.length > 0) {
      console.log('[useSubjectCache_hydrate] hydrate slice:', dbSubjects.length)
      dispatch(subjectsReceived(dbSubjects))
    }
  }, [dispatch, dbSubjects, dbIsLoading])

  const isLoading = useMemo(() => {
    // Ensures that subjects slice state gets hydrated before the UI is
    // rendered. This is required to prevent GlyphTile from fetching data that
    // is already fetched due to race condition.
    const subjectsSliceIsHydrating =
      subjects.length < (sliceMissingIds?.length ?? 0)
    console.log(
      '[useSubjectCache_hydrate] hydrate slice:',
      subjects.length,
      sliceMissingIds?.length,
    )
    console.log(
      '[useSubjectCache_hydrate] hydrate isLoading: ',
      subjectsSliceIsHydrating,
      dbIsLoading,
    )
    return dbIsLoading || subjectsSliceIsHydrating
  }, [dbIsLoading, subjects, sliceMissingIds])

  return { subjects, isLoading }
}

export const useSubjectCache = (
  subjectIds: number[] | undefined,
  cacheDependencies: boolean = true,
): Result => {
  useEffect(() => {
    console.log('[useSubjectCache] input: ', subjectIds, cacheDependencies)
  }, [subjectIds, cacheDependencies])
  const subjectIdsSafe = useMemo(() => {
    return _.uniq(subjectIds ?? [])
  }, [subjectIds])
  console.log(
    '[useSubjectCache] trigger:',
    subjectIdsSafe.slice(0, 3),
    subjectIdsSafe.length,
  )

  useEffect(() => {
    console.log('[useSubjectCache]: useEffect subjectIdsSafe')
  }, [subjectIdsSafe])

  const { subjects, isLoading: mainIsLoading } =
    useFetchSubjectsAndHydrate_v2(subjectIdsSafe)

  // Memoize subjects' dependencies (to prevent infinite loop)
  const dependencySubjectIds = useMemo(() => {
    if (!cacheDependencies) return []
    // If not all subjects are fetched yet (slice is still hydrating) - skip
    if (subjects.length !== subjectIdsSafe.length) return []

    const subjectsToFetch: number[] = []
    subjects.map(subject => {
      if (SubjectUtils.isVocabulary(subject) || SubjectUtils.isKanji(subject)) {
        subjectsToFetch.push(...subject.component_subject_ids)
      }
      if (SubjectUtils.isRadical(subject) || SubjectUtils.isKanji(subject)) {
        subjectsToFetch.push(...subject.amalgamation_subject_ids)
      }
    })

    if (subjectsToFetch.length > 0) {
      console.log(
        '[useSubjectCache] dependencies detected:',
        subjectsToFetch.slice(0, 3),
        subjectsToFetch.length,
      )
    }
    return subjectsToFetch
  }, [cacheDependencies, subjects, subjectIdsSafe.length])

  const { isLoading: dependenciesIsLoading } =
    useFetchSubjectsAndHydrate_v2(dependencySubjectIds)

  const isLoading = useMemo(() => {
    console.log(
      '[useSubjectCache] isLoading:',
      mainIsLoading,
      dependenciesIsLoading,
    )
    return mainIsLoading || dependenciesIsLoading
  }, [mainIsLoading, dependenciesIsLoading])

  return { subjects, isLoading }
}
