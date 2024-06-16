import {
  PayloadAction,
  SerializedError,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit'
import { Subject, SubjectUtils } from '../types/subject'
import { Vocabulary } from '../types/vocabulary'
import { Kanji } from '../types/kanji'
import { RootState } from './store'
// import { WaniKaniApi } from '../api/wanikani'
import { Assignment } from '../types/assignment'
import { QuizMode } from '../types/quizType'
import { TaskType } from '../types/quizTaskType'

interface BaseQuizTask {
  numberOfErrors: number
  completed: boolean
  reported: boolean
  type: TaskType
  assignmentId?: number
}

interface QuizReadingTask extends BaseQuizTask {
  subject: Vocabulary | Kanji
  type: 'reading'
}
interface QuizMeaningTask extends BaseQuizTask {
  subject: Subject
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
  reported: false,
  assignmentId,
})

const createMeaningTask = (
  subject: Subject,
  assignmentId?: number,
): QuizTask => ({
  subject,
  type: 'meaning',
  numberOfErrors: 0,
  completed: false,
  reported: false,
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
        subjects: Subject[]
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

      const createTasksFor = (subject: Subject, assignment?: Assignment) => {
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
        console.error(
          'Can not find task for id:',
          action.payload.id,
          'and type:',
          action.payload.type,
        )
        return
      }
      task.numberOfErrors++

      // Remove task and push it to the end of the queue
      const index = state.tasks.indexOf(task)
      if (index > -1) {
        state.tasks.splice(index, 1)
        // Push failed item 1...5 positions forward
        // TODO: adjust
        const randomNumber = 1 + Math.floor(Math.random() * 4)
        const newPos = Math.min(index + randomNumber, state.tasks.length)
        state.tasks.splice(newPos, 0, task)
      }
    },
    markTaskPairAsReported(
      state,
      action: PayloadAction<{ taskPair: QuizTask[] }>,
    ) {
      const tasks = state.tasks.filter(
        task => task.subject.id === action.payload.taskPair[0].subject.id,
      )

      if (tasks === undefined) {
        console.error('Can not find tasks for:', action.payload.taskPair)
        return
      }
      tasks.forEach(task => (task.reported = true))
    },
  },
})

export const {
  reset,
  init,
  answeredCorrectly,
  answeredIncorrectly,
  markTaskPairAsReported,
} = quizSlice.actions

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
export const selectTaskPairsForReport = createSelector(
  (state: RootState) => state.quizSlice.tasks,
  (state: RootState) => state.quizSlice.mode,
  (tasks, mode) => {
    // We have nothing to report in quiz mode
    if (mode === 'quiz') return []

    const completedNotReported = tasks.filter(
      task => task.completed && !task.reported,
    )
    const completedNotReportedMeanings = completedNotReported.filter(
      task => task.type === 'meaning',
    )
    const completedNotReportedReadings = completedNotReported.filter(
      task => task.type === 'reading',
    )
    const readyForReportPairs = completedNotReportedMeanings.map(task => {
      if (
        task.subject.type === 'radical' ||
        task.subject.type === 'kana_vocabulary'
      ) {
        return [task]
      }
      const answeredReadingPair = completedNotReportedReadings.find(
        readingTask => readingTask.subject.id === task.subject.id,
      )
      if (answeredReadingPair !== undefined) {
        return [task, answeredReadingPair]
      }

      return undefined
    })
    const definedTaskPairs = readyForReportPairs.filter(
      (taskPair): taskPair is QuizTask[] => taskPair !== undefined,
    )
    return definedTaskPairs
  },
)

export default quizSlice.reducer
