import { Stack } from 'expo-router'

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{
          title: 'Library',
          headerTitle: 'Library',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='subject'
        options={{
          title: 'Subject',
        }}
      />
    </Stack>
  )
}
