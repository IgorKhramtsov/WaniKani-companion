import { SessionProvider } from '@/src/context/authContext'
import { store } from '@/src/redux/store'
import { createTable } from '@/src/utils/dbHelper'
import { Slot } from 'expo-router'
import { SQLiteProvider } from 'expo-sqlite'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Provider } from 'react-redux'

export default function RootLayout() {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SessionProvider>
          <SQLiteProvider
            databaseName='wanikani.db'
            onInit={db => createTable(db)}>
            <Slot />
          </SQLiteProvider>
        </SessionProvider>
      </GestureHandlerRootView>
    </Provider>
  )
}
