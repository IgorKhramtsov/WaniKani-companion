import { SessionProvider } from '@/src/context/authContext'
import { createStore } from '@/src/redux/store'
import { dbHelper } from '@/src/utils/dbHelper'
import { Slot } from 'expo-router'
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Provider } from 'react-redux'
import { RootSiblingParent } from 'react-native-root-siblings'
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'
import { useReactQueryDevTools } from '@dev-plugins/react-query/build/useReactQueryDevTools'
import { PropsWithChildren } from 'react'
import { Platform, Text } from 'react-native'
import * as FS from 'expo-file-system'
import { FullPageLoading } from '@/src/components/FullPageLoading'

const queryClient = new QueryClient()

export default function RootLayout() {
  if (__DEV__) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useReactQueryDevTools(queryClient)
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <SqliteProvider>
            <StoreProvider>
              <RootSiblingParent>
                <Slot />
              </RootSiblingParent>
            </StoreProvider>
          </SqliteProvider>
        </QueryClientProvider>
      </SessionProvider>
    </GestureHandlerRootView>
  )
}

/// A separate component to be able to access sqlite context
const SqliteProvider = ({ children }: PropsWithChildren) => {
  const dbDirectory = useQuery({
    queryKey: ['dbDirectory'],
    queryFn: async () => {
      if (Platform.OS === 'ios') {
        return await FS.getSharedContainerUriAsync(
          'group.dev.khramtsov.wanikani',
        )
      }
      return FS.documentDirectory + 'SQLite'
    },
  })
  if (dbDirectory.isPending) {
    return <FullPageLoading />
  }
  if (dbDirectory.isError) {
    return <Text>Cannot access db directory {dbDirectory.error.message}</Text>
  }
  if (dbDirectory.data === null) {
    return <Text>Cannot access db directory (it's null)</Text>
  }

  return (
    <SQLiteProvider
      databaseName='wanikani.db'
      directory={dbDirectory.data}
      onInit={db => dbHelper.createTables(db)}>
      {children}
    </SQLiteProvider>
  )
}

/// A separate component to be able to access sqlite context
const StoreProvider = ({ children }: PropsWithChildren) => {
  const sqliteDb = useSQLiteContext()
  const store = createStore(sqliteDb)
  return <Provider store={store}>{children}</Provider>
}
