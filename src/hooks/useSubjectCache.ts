import { useMemo } from 'react'
import { SubjectUtils } from '../types/subject'
import { useGetSubjectsQuery } from '../api/wanikaniApi'

export const useSubjectCache = (
  subjectIds: number[] | undefined,
  cacheDependencies: boolean = true,
) => {
  const { data: mainSubjects, isLoading: mainIsLoading } = useGetSubjectsQuery(
    subjectIds ?? [],
    { skip: subjectIds === undefined },
  )

  // Memoize subjects' dependencies (to prevent infinite loop)
  const dependencySubjectIds = useMemo(() => {
    const subjectsToFetch: number[] = []
    console.log(
      '[useSubjectCache] mainSubjects is undefined: ',
      mainSubjects === undefined,
    )
    if (mainSubjects !== undefined) {
      mainSubjects.map(subject => {
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
  }, [mainSubjects])

  // Cache subjects' dependencies
  const { data: dependencySeubjects, isLoading: dependenciesIsLoading } =
    useGetSubjectsQuery(dependencySubjectIds, {
      skip: dependencySubjectIds.length === 0,
    })

  const subjects = useMemo(() => {
    return (mainSubjects ?? []).concat(dependencySeubjects ?? [])
  }, [mainSubjects, dependencySeubjects])
  const isLoading = useMemo(() => {
    return mainIsLoading || dependenciesIsLoading
  }, [mainIsLoading, dependenciesIsLoading])

  return { subjects, isLoading }
}
