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
import {
  PropsWithChildren,
  Suspense,
  useEffect,
  useMemo,
  useState,
} from 'react'
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
import { drizzle } from 'drizzle-orm/expo-sqlite'
import { migrate } from 'drizzle-orm/expo-sqlite/migrator'
import migrations from '@/drizzle/migrations'
import * as schema from '@/src/db/schema'
import { FullPageLoading } from '@/src/components/FullPageLoading'
import { asyncStorageHelper } from '@/src/utils/asyncStorageHelper'

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
