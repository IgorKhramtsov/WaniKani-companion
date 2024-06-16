import { useEffect, useMemo } from 'react'
import { Subject, SubjectUtils } from '../types/subject'
import { useGetSubjectsQuery } from '../api/wanikaniApi'
import { selectSubjects, subjectsReceived } from '../redux/subjectsSlice'
import { useAppDispatch, useAppSelector } from './redux'

type Result = {
  subjects: Subject[]
  isLoading: boolean
}

const useFetchSubjectsAndHydrate = (
  subjectIds: number[] | undefined,
): Result => {
  const dispatch = useAppDispatch()
  const subjectIdsSafe = useMemo(() => {
    return subjectIds ?? []
  }, [subjectIds])

  const subjects = useAppSelector(selectSubjects(subjectIdsSafe))

  const missingIds = useMemo(() => {
    return subjectIdsSafe.filter(id => !subjects.some(el => el.id === id))
  }, [subjectIdsSafe, subjects])
  if (missingIds.length > 0) {
    console.log('[useSubjectCache] fetching missing subjects: ', missingIds)
  }

  const { data: missingSubjects, isLoading: mainIsLoading } =
    // Do not fetch if there is nothing to fetch
    useGetSubjectsQuery(missingIds, { skip: missingIds.length === 0 })

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
    return subjectsSliceIsHydrating || mainIsLoading
  }, [subjects.length, missingSubjects?.length, mainIsLoading])

  return { subjects, isLoading }
}

export const useSubjectCache = (
  subjectIds: number[] | undefined,
  cacheDependencies: boolean = true,
): Result => {
  const subjectIdsSafe = useMemo(() => {
    return subjectIds ?? []
  }, [subjectIds])

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
    return subjectsToFetch
  }, [cacheDependencies, subjects, subjectIdsSafe.length])
  if (dependencySubjectIds.length > 0) {
    console.log(
      '[useSubjectCache] dependencies detected: ',
      dependencySubjectIds,
    )
  }

  const { isLoading: dependenciesIsLoading } =
    useFetchSubjectsAndHydrate(dependencySubjectIds)

  const isLoading = useMemo(() => {
    return mainIsLoading || dependenciesIsLoading
  }, [mainIsLoading, dependenciesIsLoading])

  return { subjects, isLoading }
}
