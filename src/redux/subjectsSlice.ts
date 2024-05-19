import {
  SerializedError,
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit'
import { Assignment } from '../types/assignment'
import { WaniKaniApi } from '../api/wanikani'
import { AppState } from 'react-native'
import { RootState } from './store'
import { Subject, SubjectType } from '../types/subject'

export interface SubjectsSlice {
  subjects: Record<number, SubjectType>
  status: 'idle' | 'loading' | 'failed'
  error?: SerializedError
}

const initialState: SubjectsSlice = {
  subjects: {},
  status: 'idle',
}

export const subjectsSlice = createSlice({
  name: 'subjects',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchSubject.pending, (state, _) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchSubject.fulfilled, (state, action) => {
        state.status = 'idle'
        state.subjects[action.payload.id] = action.payload.subject
      })
      .addCase(fetchSubject.rejected, (state, action) => {
        state.status = 'failed'
        console.log(action.error)
        state.error = action.error
      })
      .addCase(fetchSubjects.pending, (state, _) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.status = 'idle'
        for (const { id, subject } of action.payload) {
          state.subjects[id] = subject
        }
      })
      .addCase(fetchSubjects.rejected, (state, action) => {
        state.status = 'failed'
        console.log(action.error)
        state.error = action.error
      })
  },
})

export const fetchSubject = createAsyncThunk(
  'subjects/fetchSubject',
  async (subjectId: number) => {
    return WaniKaniApi.fetchSubject(subjectId)
  },
)

export const fetchSubjects = createAsyncThunk(
  'subjects/fetchSubjects',
  async (subjectIds: number[], { getState }) => {
    const state = getState() as RootState
    const existingIds = Object.keys(state.subjectsSlice.subjects)
    const missingids = subjectIds.filter(
      (el) => !existingIds.includes(el.toString()),
    )
    if (missingids.length === 0) {
      console.log('Nothing to fetch. Returning []')
      return []
    }

    return WaniKaniApi.fetchSubjects(missingids)
  },
)

export const selectSubject = (id?: number) => (state: RootState) => {
  if (!id) return undefined
  return state.subjectsSlice.subjects[id]
}

export default subjectsSlice.reducer
