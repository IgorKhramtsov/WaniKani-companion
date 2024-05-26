import {
  SerializedError,
  createAsyncThunk,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit'
import { WaniKaniApi } from '../api/wanikani'
import { RootState } from './store'
import { SubjectType } from '../types/subject'

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
        state.subjects[action.payload.id] = action.payload
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
        for (const subject of action.payload) {
          state.subjects[subject.id] = subject
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
      el => !existingIds.includes(el.toString()),
    )
    if (missingids.length === 0) {
      console.log('Nothing to fetch. Returning []')
      return []
    }

    return WaniKaniApi.fetchSubjects(missingids)
  },
)

export const selectStatus = (state: RootState) => state.subjectsSlice.status

export const selectSubject = (id?: number) => (state: RootState) => {
  if (!id) return undefined
  return state.subjectsSlice.subjects[id]
}
const innerSelectSubjects = createSelector(
  (state: RootState) => state.subjectsSlice.subjects,
  (_: RootState, ids?: number[]) => ids,
  (subjects, ids) => {
    if (!ids) return []
    if (Object.keys(subjects).length === 0) return []
    const selectedSubjects = ids.map(id => subjects[id])
    const definedSubjects = selectedSubjects.filter(el => el !== undefined)
    if (definedSubjects.length !== selectedSubjects.length) {
      const undefinedSubjects = selectedSubjects.filter(el => el === undefined)
      console.error(
        'Undefined subjects found during selection. Number of undefined elements: ',
        undefinedSubjects.length,
      )
    }
    return definedSubjects
  },
)
export const selectSubjects =
  (subjectIds: number[] | undefined) => (state: RootState) =>
    innerSelectSubjects(state, subjectIds)

export default subjectsSlice.reducer
