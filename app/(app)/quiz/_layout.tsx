import { Stack } from 'expo-router'
import React from 'react'
import { Image, StyleSheet, View } from 'react-native'

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{
          title: 'Home',
          headerTitle: () => (
            <View>
              <Image
                source={require('@/assets/images/wanikani-companion.png')}
                style={styles.image}
              />
            </View>
          ),
        }}
      />
    </Stack>
  )
}

const styles = StyleSheet.create({
  image: {
    height: 42,
    resizeMode: 'contain',
  },
})
