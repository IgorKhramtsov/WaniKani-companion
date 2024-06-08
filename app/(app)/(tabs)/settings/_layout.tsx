import { Stack } from 'expo-router'

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{
          title: 'Settings',
          headerTitle: 'Settings',
        }}
      />
      <Stack.Screen
        name='batchSize'
        options={{
          title: 'Batch Size',
          headerTitle: 'Batch Size',
        }}
      />
    </Stack>
  )
}
