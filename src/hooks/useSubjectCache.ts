import { useEffect, useMemo } from 'react'
import {
  fetchSubjects,
  selectStatus,
  selectSubjects,
} from '../redux/subjectsSlice'
import { useAppDispatch, useAppSelector } from './redux'
import { SubjectUtils } from '../types/subject'

export const useSubjectCache = (subjectIds: number[] | undefined) => {
  const dispatch = useAppDispatch()
  const subjects = useAppSelector(selectSubjects(subjectIds))
  const subjectSliceStatus = useAppSelector(selectStatus)

  // Cache subjects themselves
  useEffect(() => {
    console.log(
      '[useSubjectCache] subjectIds: ',
      subjectIds,
      ' dispatch: ',
      dispatch,
    )
    if (subjectIds !== undefined) {
      dispatch(fetchSubjects(subjectIds))
    }
  }, [subjectIds, dispatch])
  // Memoize subjects' dependencies (to prevent infinite loop)
  const subjectsToFetch = useMemo(() => {
    const subjectsToFetch: number[] = []
    console.log(
      '[useSubjectCache] subjects is undefined: ',
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
  }, [subjects])
  // Cache subjects' dependencies
  useEffect(() => {
    // Do not fetch if there are no subjects to fetch. This will prevent
    // loading status from resetting to idle
    if (subjectsToFetch.length > 0) {
      dispatch(fetchSubjects(subjectsToFetch))
    }
  }, [subjectsToFetch, dispatch])

  return { subjects, subjectSliceStatus }
}
