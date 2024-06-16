import { useEffect, useMemo } from 'react'
import { Subject, SubjectUtils } from '../types/subject'
import { useGetSubjectsQuery } from '../api/wanikaniApi'
import { selectSubjects, subjectsReceived } from '../redux/subjectsSlice'
import { useAppDispatch, useAppSelector } from './redux'

type Result = {
  subjects: Subject[]
  isLoading: boolean
}

export const useSubjectCache = (
  subjectIds: number[] | undefined,
  cacheDependencies: boolean = true,
): Result => {
  const dispatch = useAppDispatch()
  const subjectIdsSafe = useMemo(() => {
    return subjectIds ?? []
  }, [subjectIds])

  const subjects = useAppSelector(selectSubjects(subjectIdsSafe))

  const missingIds = useMemo(() => {
    return subjectIdsSafe.filter(id => !subjects.some(el => el.id === id))
  }, [subjectIdsSafe, subjects])

  const { data: missingSubjects, isLoading: mainIsLoading } =
    // Do not fetch if there is nothing to fetch
    useGetSubjectsQuery(missingIds, { skip: missingIds.length === 0 })

  // Populate slice cache
  useEffect(() => {
    if (missingSubjects) {
      dispatch(subjectsReceived(missingSubjects))
    }
  }, [dispatch, missingSubjects])

  // Memoize subjects' dependencies (to prevent infinite loop)
  const dependencySubjectIds = useMemo(() => {
    console.log('[useSubjectCache] cachingDependencies: ', cacheDependencies)
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

  // TODO: recursively call useSubjectCache to fetch dependencies?

  const alreadyFetchedSubjectsDependencies = useAppSelector(
    selectSubjects(dependencySubjectIds),
  )

  const missingDependencyIds = useMemo(() => {
    return dependencySubjectIds.filter(
      id => !alreadyFetchedSubjectsDependencies.some(el => el.id === id),
    )
  }, [alreadyFetchedSubjectsDependencies, dependencySubjectIds])

  // Cache subjects' dependencies
  const { data: missingDependencies, isLoading: dependenciesIsLoading } =
    useGetSubjectsQuery(missingDependencyIds, {
      skip: missingDependencyIds.length === 0,
    })

  // Populate slice cache
  useEffect(() => {
    if (missingDependencies) {
      dispatch(subjectsReceived(missingDependencies))
    }
  }, [dispatch, missingDependencies])

  const isLoading = useMemo(() => {
    // Ensures that subjects slice state gets hydrated before the UI is
    // rendered. This is required to prevent GlyphTile from fetching data that
    // is already fetched due to race condition.
    const subjectsSliceIsHydrating =
      alreadyFetchedSubjectsDependencies.length <
        (missingDependencies?.length ?? 0) ||
      subjects.length < (missingSubjects?.length ?? 0)
    return subjectsSliceIsHydrating || mainIsLoading || dependenciesIsLoading
  }, [
    alreadyFetchedSubjectsDependencies.length,
    missingDependencies?.length,
    subjects.length,
    missingSubjects?.length,
    mainIsLoading,
    dependenciesIsLoading,
  ])

  return { subjects, isLoading }
}
