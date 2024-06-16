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

  const alreadyFetchedSubjects = useAppSelector(selectSubjects(subjectIdsSafe))

  console.log(
    '[useSubjectCache] alreadyFetchedSubjects: ',
    alreadyFetchedSubjects?.length,
  )

  // TODO: fetch missing
  const { data: subjects, isLoading: mainIsLoading } = useGetSubjectsQuery(
    subjectIdsSafe,
    {
      skip:
        // Do not fetch if there is nothing to fetch
        subjectIdsSafe.length === 0 ||
        // Do not fetch if we already have all the subjects
        alreadyFetchedSubjects?.length === subjectIdsSafe.length,
    },
  )

  // Populate slice cache
  useEffect(() => {
    if (subjects) {
      dispatch(subjectsReceived(subjects))
    }
  }, [dispatch, subjects])

  const subjectsResolved = useMemo(() => {
    return subjects ?? alreadyFetchedSubjects
  }, [subjects, alreadyFetchedSubjects])

  // Memoize subjects' dependencies (to prevent infinite loop)
  const dependencySubjectIds = useMemo(() => {
    console.log('[useSubjectCache] cachingDependencies: ', cacheDependencies)
    if (!cacheDependencies) return []

    const subjectsToFetch: number[] = []
    console.log(
      '[useSubjectCache] mainSubjects is undefined: ',
      subjectsResolved === undefined,
    )
    if (subjectsResolved !== undefined) {
      subjectsResolved.map(subject => {
        if (
          SubjectUtils.isVocabulary(subject) ||
          SubjectUtils.isKanji(subject)
        ) {
          subjectsToFetch.push(...subject.component_subject_ids)
        }
        if (SubjectUtils.isRadical(subject) || SubjectUtils.isKanji(subject)) {
          subjectsToFetch.push(...subject.amalgamation_subject_ids)
        }
      })
    }
    return subjectsToFetch
  }, [subjectsResolved, cacheDependencies])

  const alreadyFetchedSubjectsDependencies = useAppSelector(
    selectSubjects(dependencySubjectIds),
  )

  // TODO: fetch missing, use slice cache
  //
  // Cache subjects' dependencies
  const { data: dependencySubjects, isLoading: dependenciesIsLoading } =
    useGetSubjectsQuery(dependencySubjectIds, {
      skip: dependencySubjectIds.length === 0,
    })

  // Populate slice cache
  useEffect(() => {
    if (dependencySubjects) {
      dispatch(subjectsReceived(dependencySubjects))
    }
  }, [dispatch, dependencySubjects])

  const isLoading = useMemo(() => {
    // Ensures that subjects slice state gets hydrated before the UI is
    // rendered. This is required to prevent GlyphTile from fetching data that
    // is already fetched due to race condition.
    const subjectsSliceIsHydrating =
      alreadyFetchedSubjectsDependencies.length <
      (dependencySubjects?.length ?? 0)
    return subjectsSliceIsHydrating || mainIsLoading || dependenciesIsLoading
  }, [
    alreadyFetchedSubjectsDependencies.length,
    dependencySubjects?.length,
    mainIsLoading,
    dependenciesIsLoading,
  ])

  const subjectsSafe = useMemo(() => {
    return subjectsResolved ?? []
  }, [subjectsResolved])

  return { subjects: subjectsSafe, isLoading }
}
