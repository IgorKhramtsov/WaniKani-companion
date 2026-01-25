import '@/src/utils/time-polyfil'
import { SessionProvider, useSession } from '@/src/context/authContext'
import { createStore } from '@/src/redux/store'
import { dbHelper } from '@/src/utils/dbHelper'
import { Slot, useNavigationContainerRef } from 'expo-router'
import { SQLiteDatabase, SQLiteProvider, useSQLiteContext } from 'expo-sqlite'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Provider } from 'react-redux'
import { RootSiblingParent } from 'react-native-root-siblings'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useReactQueryDevTools } from '@dev-plugins/react-query/build/useReactQueryDevTools'
import { PropsWithChildren, Suspense, useEffect, useMemo } from 'react'
import { Platform, Text, useColorScheme } from 'react-native'
import { Paths } from 'expo-file-system'
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native'
import * as Sentry from '@sentry/react-native'
import { isRunningInExpoGo } from 'expo'
import { captureConsoleIntegration } from '@sentry/core'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import { migrate } from 'drizzle-orm/expo-sqlite/migrator'
import migrations from '@/drizzle/migrations'
import * as schema from '@/src/db/schema'
import { FullPageLoading } from '@/src/components/FullPageLoading'
import { asyncStorageHelper } from '@/src/utils/asyncStorageHelper'
import { StyleSheet } from 'react-native-unistyles'

StyleSheet.configure({
  settings: {
    adaptiveThemes: true,
  },
  themes: {
    light: {},
    dark: {},
  },
})

const queryClient = new QueryClient()

// Construct a new instrumentation instance. This is needed to communicate between the integration and React
const routingInstrumentation = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: !isRunningInExpoGo(),
})

const DEBUG_SENTRY = false

Sentry.init({
  debug: __DEV__ && DEBUG_SENTRY,
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  tracesSampleRate: __DEV__ && DEBUG_SENTRY ? 1.0 : 0.2,
  integrations: [
    routingInstrumentation,
    captureConsoleIntegration({ levels: ['warning', 'error'] }),
  ],
  enableNativeFramesTracking: !isRunningInExpoGo(),
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
      return Paths.appleSharedContainers['group.dev.khramtsov.wanikani']?.uri
    }
    const documentDirectory = Paths.document?.uri
    return documentDirectory ? `${documentDirectory}SQLite` : null
  }, [])
  if (dbDirectory === null) {
    return <Text>Cannot access db directory (it's null)</Text>
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={<FullPageLoading />}>
            <SQLiteProvider
              databaseName='wanikani.db'
              onInit={runMigrations}
              directory={dbDirectory}
              useSuspense>
              <StoreProvider>
                <RootSiblingParent>
                  <ThemeProvider
                    value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                    <Slot />
                  </ThemeProvider>
                </RootSiblingParent>
              </StoreProvider>
            </SQLiteProvider>
          </Suspense>
        </QueryClientProvider>
      </SessionProvider>
    </GestureHandlerRootView>
  )
}

export default Sentry.wrap(RootLayout)

const runMigrations = async (db: SQLiteDatabase) => {
  const drizzleDb = drizzle(db as any, { schema })
  try {
    console.log('Migrating db')
    await migrate(drizzleDb, migrations)
  } catch (e) {
    console.log('Failed to migrate db, resetting db', e)
    await dbHelper.resetDb(db)
    await asyncStorageHelper.clearLastUpdateTime()
    await migrate(drizzleDb, migrations)
  }
}

/// A separate component to be able to access sqlite context
const StoreProvider = ({ children }: PropsWithChildren) => {
  const db = useSQLiteContext()
  const { apiKey, isLoading: isSessionLoading } = useSession()

  if (isSessionLoading) {
    return <FullPageLoading />
  }

  const store = createStore(db, apiKey)
  return <Provider store={store}>{children}</Provider>
}
