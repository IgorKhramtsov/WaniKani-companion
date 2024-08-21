import { Subject } from '../types/subject'
import { useSearchSubjectsQuery } from '../api/localDbApi'

type Result = {
  subjects: Subject[]
  isLoading: boolean
}

export const useSubjectSearch = (query: string): Result => {
  const { data: subjects, isLoading } = useSearchSubjectsQuery(query)
  return { subjects: subjects ?? [], isLoading }
}
