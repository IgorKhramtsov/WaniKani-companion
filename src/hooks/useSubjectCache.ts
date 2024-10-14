import { useEffect, useMemo } from 'react'
import { Subject, SubjectUtils } from '../types/subject'
import { selectSubjects, subjectsReceived } from '../redux/subjectsSlice'
import { useAppDispatch, useAppSelector } from './redux'
import _ from 'lodash'
import { useGetSubjectsQuery } from '../api/localDb/subject'

type Result = {
  subjects: Subject[]
  isLoading: boolean
}

const enableLogging = false
const log = (msg: any, ...params: any[]) => {
  if (enableLogging) console.log(msg, ...params)
}

const useFetchSubjectsAndHydrate_v2 = (
  subjectIds: number[] | undefined,
): Result => {
  const dispatch = useAppDispatch()
  const subjectIdsSafe = useMemo(() => {
    return _.uniq(subjectIds ?? [])
  }, [subjectIds])
  log(
    '[useSubjectCache_hydrate] hydrate:',
    subjectIdsSafe.slice(0, 3),
    subjectIdsSafe.length,
  )

  const subjects = useAppSelector(selectSubjects(subjectIdsSafe))

  useEffect(() => {
    log('[useSubjectCache_hydrate] hydrate useEffect: subjects')
  }, [subjects])

  useEffect(() => {
    log('[useSubjectCache_hydrate] hydrate useEffect: subjectIdsSafe')
  }, [subjectIdsSafe])

  const sliceMissingIds = useMemo(() => {
    log('[useSubjectCache_hydrate] useMemo: sliceMissingIds')
    const ids = subjectIdsSafe.filter(id => !subjects.some(el => el.id === id))
    if (ids.length > 0) {
      log('[useSubjectCache_hydrate] slice missing ids:', ids)
    }
    return ids
  }, [subjectIdsSafe, subjects])

  useEffect(() => {
    log('[useSubjectCache_hydrate] useEffect: sliceMissingIds')
  }, [sliceMissingIds])

  const { data: dbSubjects, isLoading: dbIsLoading } = useGetSubjectsQuery(
    sliceMissingIds,
    { skip: sliceMissingIds.length === 0 },
  )

  useEffect(() => {
    if (dbIsLoading) return

    if (dbSubjects && dbSubjects.length > 0) {
      log('[useSubjectCache_hydrate] hydrate slice:', dbSubjects.length)
      dispatch(subjectsReceived(dbSubjects))
    }
  }, [dispatch, dbSubjects, dbIsLoading])

  const isLoading = useMemo(() => {
    // Ensures that subjects slice state gets hydrated before the UI is
    // rendered. This is required to prevent GlyphTile from fetching data that
    // is already fetched due to race condition.
    const subjectsSliceIsHydrating =
      subjects.length < (sliceMissingIds?.length ?? 0)
    log(
      '[useSubjectCache_hydrate] hydrate slice:',
      subjects.length,
      sliceMissingIds?.length,
    )
    log(
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
    log('[useSubjectCache] input: ', subjectIds, cacheDependencies)
  }, [subjectIds, cacheDependencies])
  const subjectIdsSafe = useMemo(() => {
    return _.uniq(subjectIds ?? [])
  }, [subjectIds])
  log(
    '[useSubjectCache] trigger:',
    subjectIdsSafe.slice(0, 3),
    subjectIdsSafe.length,
  )

  useEffect(() => {
    log('[useSubjectCache]: useEffect subjectIdsSafe')
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
      log(
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
    log('[useSubjectCache] isLoading:', mainIsLoading, dependenciesIsLoading)
    return mainIsLoading || dependenciesIsLoading
  }, [mainIsLoading, dependenciesIsLoading])

  return { subjects, isLoading }
}
