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
  subjects: SubjectType[]
  tasks: ReviewTask[]
  index: number
  status: 'idle' | 'loading' | 'failed'
  error?: SerializedError
}

const initialState: ReviewSlice = {
  subjects: [],
  tasks: [],
  index: 0,
  status: 'idle',
}

export const reviewSlice = createSlice({
  name: 'subjects',
  initialState,
  reducers: {
    subjectsFetched(state, action: PayloadAction<SubjectType[]>) {
      state.subjects = action.payload
      for (const subject of state.subjects) {
        if (
          SubjectUtils.isVocabulary(subject) ||
          SubjectUtils.isKanji(subject)
        ) {
          state.tasks.push(createReadingTask(subject))
        }
        state.tasks.push(createMeaningTask(subject))
      }
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

export const { subjectsFetched, answeredCorrectly, answeredIncorrectly } =
  reviewSlice.actions

export const selectCurrentTask = createSelector(
  (state: RootState) => state.reviewSlice.index,
  (state: RootState) => state.reviewSlice.tasks,
  (index, tasks) => tasks[index],
)
export default reviewSlice.reducer
