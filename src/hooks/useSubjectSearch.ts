import { useSearchSubjectsQuery } from '../api/localDb/subject'
import { Subject } from '../types/subject'

type Result = {
  subjects: Subject[]
  isLoading: boolean
}

export const useSubjectSearch = (query: string): Result => {
  const { data: subjects, isLoading } = useSearchSubjectsQuery(query)
  return { subjects: subjects ?? [], isLoading }
}
