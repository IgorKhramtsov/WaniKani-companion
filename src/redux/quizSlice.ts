import {
  PayloadAction,
  SerializedError,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit'
import { SubjectType, SubjectUtils } from '../types/subject'
import { Vocabulary } from '../types/vocabulary'
import { Kanji } from '../types/kanji'
import { RootState } from './store'
import { WaniKaniApi } from '../api/wanikani'
import { Assignment } from '../types/assignment'
import { QuizMode } from '../types/quizType'

type TaskType = 'reading' | 'meaning'

interface BaseQuizTask {
  numberOfErrors: number
  completed: boolean
  type: TaskType
  assignmentId?: number
}

interface QuizReadingTask extends BaseQuizTask {
  subject: Vocabulary | Kanji
  type: 'reading'
}
interface QuizMeaningTask extends BaseQuizTask {
  subject: SubjectType
  type: 'meaning'
}

export type QuizTask = QuizReadingTask | QuizMeaningTask

export namespace QuizTaskUtils {
  export function isMeaningTask(task: QuizTask): task is QuizMeaningTask {
    return task.type === 'meaning'
  }

  export function isReadingTask(task: QuizTask): task is QuizReadingTask {
    return task.type === 'reading'
  }
}

const createReadingTask = (
  subject: Vocabulary | Kanji,
  assignmentId?: number,
): QuizTask => ({
  subject,
  type: 'reading',
  numberOfErrors: 0,
  completed: false,
  assignmentId,
})

const createMeaningTask = (
  subject: SubjectType,
  assignmentId?: number,
): QuizTask => ({
  subject,
  type: 'meaning',
  numberOfErrors: 0,
  completed: false,
  assignmentId,
})

export interface ReviewSlice {
  tasks: QuizTask[]
  index: number
  mode: QuizMode
  status: 'idle' | 'loading' | 'failed'
  error?: SerializedError
}

const initialState: ReviewSlice = {
  tasks: [],
  index: 0,
  status: 'loading',
  mode: 'quiz',
}

export const quizSlice = createSlice({
  name: 'subjects',
  initialState,
  reducers: {
    reset(state) {
      state.tasks = []
      state.index = 0
      state.status = 'loading'
      console.log('[QuizSlice] RESET')
    },
    init(
      state,
      action: PayloadAction<{
        assignments?: Assignment[]
        subjects: SubjectType[]
        mode: QuizMode
      }>,
    ) {
      console.log(
        '[QuizSlice] INIT mode: ',
        action.payload.mode,
        'subjects: ',
        action.payload.subjects.length,
        ' assignments: ',
        action.payload?.assignments?.length,
      )
      if (action.payload.subjects.length === 0) return

      const createTasksFor = (
        subject: SubjectType,
        assignment?: Assignment,
      ) => {
        if (
          SubjectUtils.isVocabulary(subject) ||
          SubjectUtils.isKanji(subject)
        ) {
          state.tasks.push(createReadingTask(subject, assignment?.id))
        }
        state.tasks.push(createMeaningTask(subject, assignment?.id))
      }

      state.mode = action.payload.mode
      if (action.payload.assignments !== undefined) {
        for (const assignment of action.payload.assignments) {
          const subject = action.payload.subjects.find(
            subject => subject.id === assignment.subject_id,
          )
          if (subject === undefined) {
            console.error('Can not find subject for assignment: ', assignment)
            continue
          }
          createTasksFor(subject, assignment)
        }
      } else {
        // If there are no assignments - we might be in a quiz mode. Create
        // tasks just based on subjects.

        for (const subject of action.payload.subjects) {
          createTasksFor(subject)
        }
      }

      // TODO: shuffle

      state.status = 'idle'
    },
    answeredCorrectly(
      state,
      action: PayloadAction<{ id: number; type: TaskType }>,
    ) {
      const allTasksForSubject = state.tasks.filter(
        task => task.subject.id === action.payload.id,
      )
      const task = allTasksForSubject.find(
        task =>
          task.subject.id === action.payload.id &&
          task.type === action.payload.type,
      )
      if (task === undefined) {
        console.error('Can not find task: ', task)
        return
      }
      task.completed = true
      state.index++

      if (state.mode === 'quiz') return

      if (allTasksForSubject.every(task => task.completed)) {
        const incorrect_meaning_answers =
          allTasksForSubject.find(task => task.type === 'meaning')
            ?.numberOfErrors ?? 0
        const incorrect_reading_answers =
          allTasksForSubject.find(task => task.type === 'reading')
            ?.numberOfErrors ?? 0
        console.log(
          'quiz result for subject: ',
          task.subject.id,
          '\n\tincorrect_meanings: ',
          incorrect_meaning_answers,
          '\n\tincorrect_readings: ',
          incorrect_reading_answers,
        )
        if (state.mode === 'review') {
          console.log('creating review')
          WaniKaniApi.createReview({
            subject_id: task.subject.id,
            incorrect_meaning_answers,
            incorrect_reading_answers,
          })
        }
        if (state.mode === 'lessonsQuiz') {
          const assignmentId = allTasksForSubject[0].assignmentId
          if (assignmentId === undefined) {
            console.error(
              'Can not find assignment id for subject: ',
              task.subject,
            )
            return
          }
          console.log('starting an assignment')
          WaniKaniApi.startAssignment(assignmentId)
        }
      }
    },
    answeredIncorrectly(
      state,
      action: PayloadAction<{ id: number; type: TaskType }>,
    ) {
      const task = state.tasks.find(
        task =>
          task.subject.id === action.payload.id &&
          task.type === action.payload.type,
      )
      if (task === undefined) {
        console.error('Can not find task: ', task)
        return
      }
      task.numberOfErrors++

      // Remove task and push it to the end of the queue
      const index = state.tasks.indexOf(task)
      if (index > -1) {
        state.tasks.splice(index, 1)
        // Push failed item 1...5 positions forward
        const randomNumber = 1 + Math.floor(Math.random() * 4)
        const newPos = Math.min(index + randomNumber, state.tasks.length)
        state.tasks.splice(newPos, 0, task)
      }
    },
  },
})

export const { reset, init, answeredCorrectly, answeredIncorrectly } =
  quizSlice.actions

export const selectStatus = (state: RootState) => state.quizSlice.status
export const selectProgress = createSelector(
  (state: RootState) => state.quizSlice.tasks,
  tasks => {
    const completed = tasks.filter(task => task.completed).length
    const total = tasks.length
    if (total === 0) return 0

    return Math.floor((completed / total) * 100)
  },
)
export const selectCurrentTask = createSelector(
  (state: RootState) => state.quizSlice.index,
  (state: RootState) => state.quizSlice.tasks,
  (index, tasks) => {
    console.log(
      'Selecting current task. index: ',
      index,
      ' tasks: ',
      tasks.length,
    )
    return tasks[index]
  },
)
export const selectNextTask = createSelector(
  (state: RootState) => state.quizSlice.index,
  (state: RootState) => state.quizSlice.tasks,
  (index, tasks): QuizTask | undefined => tasks[index + 1],
)

export default quizSlice.reducer
