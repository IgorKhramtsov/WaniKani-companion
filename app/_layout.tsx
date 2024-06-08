import { store } from '@/src/redux/store'
import { Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Provider } from 'react-redux'

export default function RootLayout() {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
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
      </GestureHandlerRootView>
    </Provider>
  )
}
