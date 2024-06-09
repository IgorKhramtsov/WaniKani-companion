import {
  SerializedError,
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit'
import { WaniKaniApi } from '../api/wanikani'
import { Preferences } from '../types/preferences'
import { RootState } from './store'

export interface SettingsSlice {
  preferences?: Preferences
  status: 'loading' | 'idle' | 'failed'
  error?: SerializedError
}

const initialState: SettingsSlice = {
  status: 'loading',
}

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchSettings.pending, (state, _) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.preferences = action.payload.preferences
        state.status = 'idle'
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.status = 'failed'
        console.log(action.error)
        state.error = action.error
      })
      .addCase(updateSettings.pending, (state, _) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.preferences = action.payload.preferences
        state.status = 'idle'
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.status = 'failed'
        console.log(action.error)
        state.error = action.error
      })
  },
})

export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async () => {
    return WaniKaniApi.fetchSettings()
  },
)

export const updateSettings = createAsyncThunk(
  'settings/updateSettings',
  async (preferences: Preferences) => {
    return WaniKaniApi.updateSettings(preferences)
  },
)

export const selectPreferences = (state: RootState) =>
  state.settingsSlice.preferences
export const selectStatus = (state: RootState) =>
  state.settingsSlice.status

export default settingsSlice.reducer
