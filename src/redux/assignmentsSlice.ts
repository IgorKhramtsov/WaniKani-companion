import {
  SerializedError,
  createAsyncThunk,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit'
import { Assignment } from '../types/assignment'
import { WaniKaniApi } from '../api/wanikani'
import { RootState } from './store'

// TODO: restrict number of lessons by the value from the user account settings
// to match the website behavior
export interface AssignmentsSlice {
  lessons: Assignment[]
  reviews: Assignment[]
  status: 'idle' | 'loading' | 'failed'
  error?: SerializedError
}

const initialState: AssignmentsSlice = {
  lessons: [],
  reviews: [],
  status: 'idle',
}

export const assignmentsSlice = createSlice({
  name: 'assignments',
  initialState,
  // https://redux.js.org/tutorials/typescript-quick-start#define-slice-state-and-action-types
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchLessonsAndReviews.pending, (state, _) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchLessonsAndReviews.fulfilled, (state, action) => {
        state.status = 'idle'
        state.lessons = action.payload.lessons
        console.log(
          '[AssignmentsSlice] fetched reviews',
          action.payload.reviews.map(el => el.subject_id),
        )
        state.reviews = action.payload.reviews
      })
      .addCase(fetchLessonsAndReviews.rejected, (state, action) => {
        state.status = 'failed'
        console.log(action.error)
        state.error = action.error
      })
  },
})

export const fetchLessonsAndReviews = createAsyncThunk(
  'lessons/fetchLessonsAndReviews',
  async () => {
    const [lessons, reviews] = await Promise.all([
      WaniKaniApi.fetchLessons(),
      WaniKaniApi.fetchReviews(),
    ])
    return { lessons, reviews }
  },
)

export const selectStatus = (state: RootState) => state.assignmentsSlice.status
export const selectLessonsCount = (state: RootState) =>
  state.assignmentsSlice.lessons.length
export const selectReviewsCount = (state: RootState) =>
  state.assignmentsSlice.reviews.length
export const selectError = (state: RootState) => state.assignmentsSlice.error
const selectLessons = (state: RootState) => state.assignmentsSlice.lessons
// TODO: batch size setting
export const selectLessonsBatch = createSelector(selectLessons, lessons =>
  lessons.slice(0, 5).map(el => el.subject_id),
)
const selectReviews = (state: RootState) => state.assignmentsSlice.reviews
export const selectReviewsBatch = createSelector(selectReviews, reviews =>
  reviews.map(el => el.subject_id),
)

export default assignmentsSlice.reducer
