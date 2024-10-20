import { FontAwesome } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import React from 'react'

export const tabsNavigatorId = 'HomeTabs'

export default function TabLayout() {
  return (
    <Tabs
      id={tabsNavigatorId}
      screenOptions={{
        tabBarActiveTintColor: 'black',
        headerShown: false,
        tabBarStyle: {
          // TODO: make it glass like ?
          paddingTop: 8,
        },
      }}>
      <Tabs.Screen name='index' options={{ href: null }} />
      <Tabs.Screen
        name='home'
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome name='home' size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='library'
        options={{
          title: 'Library',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome name='search' size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='settings'
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome name='gear' size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
