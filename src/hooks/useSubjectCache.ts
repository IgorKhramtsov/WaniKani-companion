import { useEffect, useMemo, useState } from 'react'
import { SubjectUtils } from '../types/subject'
import { useGetSubjectsQuery } from '../api/wanikaniApi'

export const useSubjectCache = (
  subjectIds: number[] | undefined,
  cacheDependencies: boolean = true,
) => {
  // TODO: do we need local state here??
  const [dependenciesFetched, setDependenciesFetched] = useState(false)
  const { data: subjects, isLoading: mainIsLoading } = useGetSubjectsQuery(
    subjectIds ?? [],
    { skip: subjectIds === undefined },
  )

  // Memoize subjects' dependencies (to prevent infinite loop)
  const dependencySubjectIds = useMemo(() => {
    console.log('[useSubjectCache] cachingDependencies: ', cacheDependencies)
    if (!cacheDependencies) return []

    const subjectsToFetch: number[] = []
    console.log(
      '[useSubjectCache] mainSubjects is undefined: ',
      subjects === undefined,
    )
    if (subjects !== undefined) {
      subjects.map(subject => {
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
  }, [subjects, cacheDependencies])

  // Cache subjects' dependencies
  const { data: dependencySeubjects, isLoading: dependenciesIsLoading } =
    useGetSubjectsQuery(dependencySubjectIds, {
      skip: dependencySubjectIds.length === 0,
    })

  // True if dependencies have been fetched or if we don't need to cache
  // dependencies
  const dependenciesFetchedResolved = useMemo(() => {
    return (
      dependenciesFetched ||
      !cacheDependencies ||
      (subjectIds ?? []).length === 0
    )
  }, [cacheDependencies, dependenciesFetched, subjectIds])

  useEffect(() => {
    // If dependencies have been fetched or if we don't need to cache
    // dependencies - skip
    if (dependenciesFetchedResolved) return

    // If we fetched main subjects
    if ((subjects?.length ?? 0) > 0) {
      // And we fetched dependencies
      if ((dependencySeubjects?.length ?? 0) > 0) {
        // Set dependencies fetched to true
        setDependenciesFetched(true)
      }
    }
  }, [
    dependenciesFetchedResolved,
    dependencySeubjects?.length,
    subjects?.length,
  ])

  const isLoading = useMemo(() => {
    return (
      !dependenciesFetchedResolved || mainIsLoading || dependenciesIsLoading
    )
  }, [dependenciesFetchedResolved, mainIsLoading, dependenciesIsLoading])

  const subjectsSafe = useMemo(() => {
    return subjects ?? []
  }, [subjects])

  return { subjects: subjectsSafe, isLoading }
}
