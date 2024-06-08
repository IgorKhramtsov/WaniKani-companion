import { SessionProvider } from '@/src/context/authContext'
import { store } from '@/src/redux/store'
import { Slot } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Provider } from 'react-redux'

export default function RootLayout() {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SessionProvider>
          <Slot />
        </SessionProvider>
      </GestureHandlerRootView>
    </Provider>
  )
}
