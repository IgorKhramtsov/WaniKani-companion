import { TaskType } from './quizTaskType'
import { SubjectType } from './subject'

export interface QuizTask {
  numberOfErrors: number
  completed: boolean
  reported: boolean
  type: TaskType
  subjectId: number
  subjectType: SubjectType
  assignmentId?: number
}
