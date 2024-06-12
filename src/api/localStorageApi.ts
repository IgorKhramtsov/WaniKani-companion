import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  LocalSettings,
  localSettingsDefautlValue,
} from '../types/localSettings'

const asyncStorageKey = 'preferences'

export const localSettingsApi = createApi({
  reducerPath: 'localSettingsApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['LocalSettings'],
  endpoints: build => ({
    getSettings: build.query<LocalSettings, void>({
      queryFn: async () => {
        try {
          const value = await AsyncStorage.getItem(asyncStorageKey)
          const data =
            value != null ? JSON.parse(value) : localSettingsDefautlValue
          return { data }
        } catch (e) {
          console.error('Failed to get settings. ', e)
          const error = `unable to get settings from async storage: ${e}`
          return { error }
        }
      },
      providesTags: ['LocalSettings'],
    }),
    setSettings: build.mutation<LocalSettings, LocalSettings>({
      queryFn: async (settings: LocalSettings) => {
        try {
          await AsyncStorage.setItem(asyncStorageKey, JSON.stringify(settings))
          return { data: settings }
        } catch (error) {
          return { error }
        }
      },
      invalidatesTags: ['LocalSettings'],
      onQueryStarted: (arg, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          localSettingsApi.util.updateQueryData(
            'getSettings',
            undefined,
            (draft: LocalSettings) => {
              Object.assign(draft, arg)
            },
          ),
        )
        queryFulfilled
          .then(data => {
            dispatch(
              localSettingsApi.util.updateQueryData(
                'getSettings',
                undefined,
                (draft: LocalSettings) => {
                  Object.assign(draft, data.data)
                },
              ),
            )
          })
          .catch(patchResult.undo)
      },
    }),
  }),
})

export const { useGetSettingsQuery, useSetSettingsMutation } = localSettingsApi
