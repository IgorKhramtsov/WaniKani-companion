import { SerializedError, createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { Assignment } from "../types/assignment"
import { WaniKaniApi } from "../api/wanikani"

// TODO: restrict number of lessons by the value from the user account settings
// to match the website behavior
export interface LessonSlice {
  lessons: Assignment[],
  reviews: Assignment[],
  status: 'idle' | 'loading' | 'failed',
  error?: SerializedError,
}

const initialState: LessonSlice = {
  lessons: [],
  reviews: [],
  status: 'idle',
}

export const lessonsSlice = createSlice({
  name: 'lesson',
  initialState,
  // https://redux.js.org/tutorials/typescript-quick-start#define-slice-state-and-action-types
  reducers: {

  },
  extraReducers(builder) {
    builder
      .addCase(fetchLessonsAndReviews.pending, (state, _) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchLessonsAndReviews.fulfilled, (state, action) => {
        state.status = 'idle'
        state.lessons = action.payload.lessons
        state.reviews = action.payload.reviews
      })
      .addCase(fetchLessonsAndReviews.rejected, (state, action) => {
        state.status = 'failed'
        console.log(action.error)
        state.error = action.error
      })
  }
})

export const fetchLessonsAndReviews = createAsyncThunk('lessons/fetchLessonsAndReviews', async () => {
  const [lessons, reviews] = await Promise.all([
    WaniKaniApi.fetchLessons(),
    WaniKaniApi.fetchReviews()
  ]);
  return { lessons, reviews };
})

// export const { inc, dec } = lessonsSlice.actions

// Other code such as selectors can use the imported `RootState` type
// export const selectCount = (state: RootState) => state.counter.value

export default lessonsSlice.reducer