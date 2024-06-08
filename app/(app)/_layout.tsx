import { WaniKaniApi } from '@/src/api/wanikani'
import { FullPageLoading } from '@/src/components/FullPageLoading'
import { useSession } from '@/src/context/authContext'
import { Redirect, Stack } from 'expo-router'

export default function RootLayout() {
  const { apiKey, isLoading } = useSession()
  if (isLoading) {
    return <FullPageLoading />
  }

  if (!apiKey) {
    return <Redirect href='/signin' />
  }
  if (WaniKaniApi.getApiKey() !== apiKey) {
    WaniKaniApi.setApiKey(apiKey)
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
        }}
      />
      <Stack.Screen
        name='lessons/index'
        options={{
          title: 'Lessons',
          headerTitle: 'Lessons',
        }}
      />
      <Stack.Screen
        name='quiz/index'
        options={{
          title: 'Quiz',
          headerTitle: 'Quiz',
        }}
      />
    </Stack>
  )
}
