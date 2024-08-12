import { SessionProvider } from '@/src/context/authContext'
import { store } from '@/src/redux/store'
import { createTables } from '@/src/utils/dbHelper'
import { Slot } from 'expo-router'
import { SQLiteProvider } from 'expo-sqlite'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Provider } from 'react-redux'
import { RootSiblingParent } from 'react-native-root-siblings'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useReactQueryDevTools } from '@dev-plugins/react-query/build/useReactQueryDevTools'

const queryClient = new QueryClient()

export default function RootLayout() {
  if (__DEV__) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useReactQueryDevTools(queryClient)
  }

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SessionProvider>
          <SQLiteProvider
            databaseName='wanikani.db'
            onInit={db => createTables(db)}>
            <QueryClientProvider client={queryClient}>
              <RootSiblingParent>
                <Slot />
              </RootSiblingParent>
            </QueryClientProvider>
          </SQLiteProvider>
        </SessionProvider>
      </GestureHandlerRootView>
    </Provider>
  )
}
