import {
  SerializedError,
  createAsyncThunk,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit'
// import { WaniKaniApi } from '../api/wanikani'
import { RootState } from './store'
import { Subject } from '../types/subject'

export interface SubjectsSlice {
  subjects: Record<number, Subject>
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
  extraReducers(builder) {},
})

// export const fetchSubject = createAsyncThunk(
//   'subjects/fetchSubject',
//   async (subjectId: number) => {
//     return WaniKaniApi.fetchSubject(subjectId)
//   },
// )
//
// export const fetchSubjects = createAsyncThunk(
//   'subjects/fetchSubjects',
//   async (subjectIds: number[], { getState }) => {
//     const state = getState() as RootState
//     const existingIds = Object.keys(state.subjectsSlice.subjects)
//     console.log('[SubjectsSlice] existingIds: ', existingIds)
//     const missingids = subjectIds.filter(
//       el => !existingIds.includes(el.toString()),
//     )
//     if (missingids.length === 0) {
//       console.log('[SubjectsSlice] Nothing to fetch. Returning []')
//       return []
//     }
//
//     console.log('[SubjectsSlice] fetching subjects: ', missingids)
//     return WaniKaniApi.fetchSubjects(missingids)
//   },
// )
//
// export const selectStatus = (state: RootState) => state.subjectsSlice.status
//
// const selectSubjectInner = createSelector(
//   (state: RootState) => state.subjectsSlice.subjects,
//   (_: RootState, id?: number) => id,
//   (subjects, id) => {
//     if (!id) return undefined
//     return subjects[id]
//   },
// )
//
// export const selectSubject = (id: number | undefined) => (state: RootState) =>
//   selectSubjectInner(state, id)
//
// const innerSelectSubjects = createSelector(
//   (state: RootState) => state.subjectsSlice.subjects,
//   (_: RootState, ids?: number[]) => ids,
//   (subjects, ids) => {
//     if (!ids) return []
//     if (Object.keys(subjects).length === 0) return []
//     const selectedSubjects = ids.map(id => subjects[id])
//     const definedSubjects = selectedSubjects.filter(el => el !== undefined)
//     if (definedSubjects.length !== selectedSubjects.length) {
//       const undefinedSubjects = selectedSubjects.filter(el => el === undefined)
//       console.log(
//         'Undefined subjects found during selection. Number of undefined elements: ',
//         undefinedSubjects.length,
//         '. This is fine as long as this happens during subjects loading.',
//       )
//     }
//     return definedSubjects
//   },
// )
// export const selectSubjects =
//   (subjectIds: number[] | undefined) => (state: RootState) =>
//     innerSelectSubjects(state, subjectIds)

export default subjectsSlice.reducer
