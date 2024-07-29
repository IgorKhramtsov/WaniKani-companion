import { SessionProvider } from '@/src/context/authContext'
import { store } from '@/src/redux/store'
import { createTable } from '@/src/utils/dbHelper'
import { Slot } from 'expo-router'
import { SQLiteProvider } from 'expo-sqlite'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Provider } from 'react-redux'
import { RootSiblingParent } from 'react-native-root-siblings'

export default function RootLayout() {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SessionProvider>
          <SQLiteProvider
            databaseName='wanikani.db'
            onInit={db => createTable(db)}>
            <RootSiblingParent>
              <Slot />
            </RootSiblingParent>
          </SQLiteProvider>
        </SessionProvider>
      </GestureHandlerRootView>
    </Provider>
  )
}
