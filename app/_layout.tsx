import { SessionProvider } from '@/src/context/authContext'
import { createStore } from '@/src/redux/store'
import { dbHelper } from '@/src/utils/dbHelper'
import { Slot, useNavigationContainerRef } from 'expo-router'
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Provider } from 'react-redux'
import { RootSiblingParent } from 'react-native-root-siblings'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useReactQueryDevTools } from '@dev-plugins/react-query/build/useReactQueryDevTools'
import { PropsWithChildren, useEffect, useMemo } from 'react'
import { Platform, Text, useColorScheme } from 'react-native'
import * as FS from 'expo-file-system'
import { Directory } from 'expo-file-system/next'
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native'
import * as Sentry from '@sentry/react-native'
import { isRunningInExpoGo } from 'expo'
import { captureConsoleIntegration } from '@sentry/integrations'

const queryClient = new QueryClient()

// Construct a new instrumentation instance. This is needed to communicate between the integration and React
const routingInstrumentation = new Sentry.ReactNavigationInstrumentation()

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.2,
  integrations: [
    new Sentry.ReactNativeTracing({
      // Pass instrumentation to be used as `routingInstrumentation`
      routingInstrumentation,
      enableNativeFramesTracking: !isRunningInExpoGo(),
    }),
    captureConsoleIntegration({ levels: ['warning', 'error'] }),
  ],
})

export function RootLayout() {
  if (__DEV__) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useReactQueryDevTools(queryClient)
  }
  // Capture the NavigationContainer ref and register it with the instrumentation.
  const ref = useNavigationContainerRef()

  useEffect(() => {
    if (ref) {
      routingInstrumentation.registerNavigationContainer(ref)
    }
  }, [ref])
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

export default Sentry.wrap(RootLayout)

/// A separate component to be able to access sqlite context
const StoreProvider = ({ children }: PropsWithChildren) => {
  const sqliteDb = useSQLiteContext()
  const store = createStore(sqliteDb)
  return <Provider store={store}>{children}</Provider>
}
