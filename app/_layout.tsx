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
import { PropsWithChildren } from 'react'

const queryClient = new QueryClient()

export default function RootLayout() {
  if (__DEV__) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useReactQueryDevTools(queryClient)
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SessionProvider>
        <SQLiteProvider
          databaseName='wanikani.db'
          onInit={db => dbHelper.createTables(db)}>
          <StoreProvider>
            <QueryClientProvider client={queryClient}>
              <RootSiblingParent>
                <Slot />
              </RootSiblingParent>
            </QueryClientProvider>
          </StoreProvider>
        </SQLiteProvider>
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
