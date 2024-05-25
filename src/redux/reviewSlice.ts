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

type TaskType = 'reading' | 'meaning'

interface BaseReviewTask {
  numberOfErrors: number
  completed: boolean
  type: TaskType
}

interface ReviewReadingTask extends BaseReviewTask {
  subject: Vocabulary | Kanji
  type: 'reading'
}
interface ReviewMeaningTask extends BaseReviewTask {
  subject: SubjectType
  type: 'meaning'
}

export type ReviewTask = ReviewReadingTask | ReviewMeaningTask

export namespace ReviewTaskUtils {
  export function isMeaningTask(task: ReviewTask): task is ReviewMeaningTask {
    return task.type === 'meaning'
  }

  export function isReadingTask(task: ReviewTask): task is ReviewReadingTask {
    return task.type === 'reading'
  }
}

const createReadingTask = (subject: Vocabulary | Kanji): ReviewTask => ({
  subject,
  type: 'reading',
  numberOfErrors: 0,
  completed: false,
})
const createMeaningTask = (subject: SubjectType): ReviewTask => ({
  subject,
  type: 'meaning',
  numberOfErrors: 0,
  completed: false,
})

export interface ReviewSlice {
  tasks: ReviewTask[]
  index: number
  status: 'idle' | 'loading' | 'failed'
  error?: SerializedError
}

const initialState: ReviewSlice = {
  tasks: [],
  index: 0,
  status: 'loading',
}

export const reviewSlice = createSlice({
  name: 'subjects',
  initialState,
  reducers: {
    reset(state) {
      state.tasks = []
      state.index = 0
      state.status = 'loading'
      console.log('RESET')
    },
    init(state, action: PayloadAction<SubjectType[]>) {
      console.log('INIT', action.payload.length)
      if (action.payload.length === 0) return

      for (const subject of action.payload) {
        if (
          SubjectUtils.isVocabulary(subject) ||
          SubjectUtils.isKanji(subject)
        ) {
          state.tasks.push(createReadingTask(subject))
        }
        state.tasks.push(createMeaningTask(subject))
      }
      state.status = 'idle'
    },
    answeredCorrectly(
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
        console.error('Can not find task: ', task)
        return
      }
      task.numberOfErrors++
      state.index++
    },
  },
})

export const { reset, init, answeredCorrectly, answeredIncorrectly } =
  reviewSlice.actions

export const selectStatus = (state: RootState) => state.reviewSlice.status
export const selectProgress = createSelector(
  (state: RootState) => state.reviewSlice.tasks,
  tasks => {
    const completed = tasks.filter(task => task.completed).length
    const total = tasks.length
    if (total === 0) return 0

    return Math.floor((completed / total) * 100)
  },
)
export const selectCurrentTask = createSelector(
  (state: RootState) => state.reviewSlice.index,
  (state: RootState) => state.reviewSlice.tasks,
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
  (state: RootState) => state.reviewSlice.index,
  (state: RootState) => state.reviewSlice.tasks,
  (index, tasks): ReviewTask | undefined => tasks[index + 1],
)

export default reviewSlice.reducer
