import { getApiKey, setApiKey } from '@/src/api/wanikaniApi'
import { FullPageLoading } from '@/src/components/FullPageLoading'
import { useSession } from '@/src/context/authContext'
import { useDbHydrator } from '@/src/hooks/useDbHydrator'
import { useWidgetPropagator } from '@/src/hooks/useWidgetPropagator'
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin'
import { Redirect, Stack } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'
import { useEffect } from 'react'
import { Text, View } from 'react-native'
import * as Progress from 'react-native-progress'

export default function RootLayout() {
  const { apiKey, isLoading: isSessionLoading } = useSession()
  const db = useSQLiteContext()
  if (__DEV__) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useDrizzleStudio(db as any)
  }

  useEffect(() => {
    if (!apiKey || isSessionLoading) return

    if (getApiKey() !== apiKey) {
      setApiKey(apiKey)
    }
  }, [apiKey, isSessionLoading])

  // Run hydrator after apiKey has been set
  const {
    isLoading: isHydrating,
    progress: hydrationProgress,
    totalCount: hydrationTotalCount,
    objectsFetched: hydrationDoneCount,
  } = useDbHydrator(getApiKey() != null)
  useWidgetPropagator()

  if (isSessionLoading) {
    return <FullPageLoading />
  }

  if (!apiKey) {
    return <Redirect href='/signin' />
  }

  if (isHydrating) {
    console.log('hydrationProgress', hydrationProgress)
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Progress.Bar
          indeterminate={hydrationTotalCount === undefined}
          progress={hydrationProgress}
          width={200}
        />
        {hydrationTotalCount !== undefined && (
          <Text>
            fetching {hydrationDoneCount} of {hydrationTotalCount}
          </Text>
        )}
      </View>
    )
  }

  return (
    <Stack>
      <Stack.Screen
        name='(tabs)'
        options={{ title: 'Home', headerShown: false }}
      />
      <Stack.Screen
        name='review/index'
        options={{
          title: 'Review',
          headerTitle: 'Review',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='lessons/index'
        options={{
          title: 'Lessons',
          headerTitle: 'Lessons',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='lessonPicker/index'
        options={{
          title: 'Lesson Picker',
          headerTitle: 'Lesson Picker',
        }}
      />
      <Stack.Screen
        name='quiz/index'
        // name='quiz'
        options={{
          title: 'Quiz',
          headerTitle: 'Quiz',
          headerShown: false,
        }}
      />
    </Stack>
  )
}
