import { SessionProvider } from '@/src/context/authContext'
import { createStore } from '@/src/redux/store'
import { dbHelper } from '@/src/utils/dbHelper'
import { Slot } from 'expo-router'
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Provider } from 'react-redux'
import { RootSiblingParent } from 'react-native-root-siblings'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useReactQueryDevTools } from '@dev-plugins/react-query/build/useReactQueryDevTools'
import { PropsWithChildren, useMemo } from 'react'
import { Platform, Text, useColorScheme } from 'react-native'
import * as FS from 'expo-file-system'
import { Directory } from 'expo-file-system/next'
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native'

const queryClient = new QueryClient()

export default function RootLayout() {
  if (__DEV__) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useReactQueryDevTools(queryClient)
  }
  const colorScheme = useColorScheme()
  const dbDirectory = useMemo(() => {
    if (Platform.OS === 'ios') {
      return Directory.getSharedContainerUri('group.dev.khramtsov.wanikani')
        ?.path
    }
    return FS.documentDirectory + 'SQLite'
  }, [])
  if (dbDirectory === null) {
    return <Text>Cannot access db directory (it's null)</Text>
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <SQLiteProvider
            databaseName='wanikani.db'
            directory={dbDirectory}
            onInit={db => dbHelper.createTables(db)}>
            <StoreProvider>
              <RootSiblingParent>
                <ThemeProvider
                  value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                  <Slot />
                </ThemeProvider>
              </RootSiblingParent>
            </StoreProvider>
          </SQLiteProvider>
        </QueryClientProvider>
      </SessionProvider>
    </GestureHandlerRootView>
  )
}

/// A separate component to be able to access sqlite context
const StoreProvider = ({ children }: PropsWithChildren) => {
  const sqliteDb = useSQLiteContext()
  const store = createStore(sqliteDb)
  return <Provider store={store}>{children}</Provider>
}
