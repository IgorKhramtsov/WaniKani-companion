import { useEffect, useMemo } from 'react'
import { Subject, SubjectUtils } from '../types/subject'
import { useGetSubjectsQuery } from '../api/wanikaniApi'
import { selectSubjects, subjectsReceived } from '../redux/subjectsSlice'
import { useAppDispatch, useAppSelector } from './redux'
import _ from 'lodash'

type Result = {
  subjects: Subject[]
  isLoading: boolean
}

const useFetchSubjectsAndHydrate = (
  subjectIds: number[] | undefined,
): Result => {
  const dispatch = useAppDispatch()
  const subjectIdsSafe = useMemo(() => {
    return _.uniq(subjectIds ?? [])
  }, [subjectIds])
  console.log(
    '[useSubjectCache] hydrate:',
    subjectIdsSafe.slice(0, 3),
    subjectIdsSafe.length,
  )

  const subjects = useAppSelector(selectSubjects(subjectIdsSafe))

  const missingIds = useMemo(() => {
    const ids = subjectIdsSafe.filter(id => !subjects.some(el => el.id === id))
    if (ids.length > 0) {
      console.log('[useSubjectCache] fetching missing subjects:', ids)
    }
    return ids
  }, [subjectIdsSafe, subjects])

  const { data: missingSubjectsFromQuery, isLoading: mainIsLoading } =
    // Do not fetch if there is nothing to fetch
    useGetSubjectsQuery(missingIds, { skip: missingIds.length === 0 })

  // If at first we requested N subjects but later we requested N-1 subjects -
  // the useGetSubjectsQuery query won't be fired as missingIds is empty, but
  // missingSubjectsFromQuery will contain old data (N) which will cause a bug
  // in isLoading memo calculation (because N-1 < N)
  const missingSubjects = useMemo(() => {
    if (missingIds.length > 0) return missingSubjectsFromQuery
    return []
  }, [missingIds, missingSubjectsFromQuery])

  // Populate slice cache
  useEffect(() => {
    if (missingSubjects) {
      dispatch(subjectsReceived(missingSubjects))
    }
  }, [dispatch, missingSubjects])

  const isLoading = useMemo(() => {
    // Ensures that subjects slice state gets hydrated before the UI is
    // rendered. This is required to prevent GlyphTile from fetching data that
    // is already fetched due to race condition.
    const subjectsSliceIsHydrating =
      subjects.length < (missingSubjects?.length ?? 0)
    console.log(
      '[useSubjectCache] hydrate slice:',
      subjects.length,
      missingSubjects?.length,
    )
    console.log(
      '[useSubjectCache] hydrate isLoading: ',
      subjectsSliceIsHydrating,
      mainIsLoading,
    )
    return subjectsSliceIsHydrating || mainIsLoading
  }, [subjects.length, missingSubjects?.length, mainIsLoading])

  return { subjects, isLoading }
}

export const useSubjectCache = (
  subjectIds: number[] | undefined,
  cacheDependencies: boolean = true,
): Result => {
  const subjectIdsSafe = useMemo(() => {
    return _.uniq(subjectIds ?? [])
  }, [subjectIds])
  console.log(
    '[useSubjectCache]:',
    subjectIdsSafe.slice(0, 3),
    subjectIdsSafe.length,
  )

  const { subjects, isLoading: mainIsLoading } =
    useFetchSubjectsAndHydrate(subjectIdsSafe)

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
    useFetchSubjectsAndHydrate(dependencySubjectIds)

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
