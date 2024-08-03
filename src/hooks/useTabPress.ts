// useScrollToTop from react-navigation

import {
  EventArg,
  NavigationContext,
  NavigationProp,
  ParamListBase,
  useRoute,
} from '@react-navigation/core'
import * as React from 'react'

/// A hook that will invoke [onTabPressFn] on tab press to run custom logic
/// such as scroll to top.
export const useTabPress = (onTabPressFn: () => void) => {
  const navigation = React.useContext(NavigationContext)
  const route = useRoute()

  const fnRef = React.useRef(onTabPressFn)
  fnRef.current = onTabPressFn

  if (navigation === undefined) {
    throw new Error(
      "Couldn't find a navigation object. Is your component inside NavigationContainer?",
    )
  }

  React.useEffect(() => {
    const tabNavigations: NavigationProp<ParamListBase>[] = []
    let currentNavigation = navigation
    // If the screen is nested inside multiple tab navigators, we should scroll to top for any of them
    // So we need to find all the parent tab navigators and add the listeners there
    while (currentNavigation) {
      if (currentNavigation.getState().type === 'tab') {
        tabNavigations.push(currentNavigation)
      }

      currentNavigation = currentNavigation.getParent()
    }

    if (tabNavigations.length === 0) {
      return
    }

    const unsubscribers = tabNavigations.map(tab => {
      return tab.addListener(
        // We don't wanna import tab types here to avoid extra deps
        // in addition, there are multiple tab implementations
        // @ts-expect-error
        'tabPress',
        (e: EventArg<'tabPress', true>) => {
          // We should scroll to top only when the screen is focused
          const isFocused = navigation.isFocused()

          // In a nested stack navigator, tab press resets the stack to first screen
          // So we should scroll to top only when we are on first screen
          const isFirst =
            tabNavigations.includes(navigation) ||
            navigation.getState().routes[0].key === route.key

          // Run the operation in the next frame so we're sure all listeners have been run
          // This is necessary to know if preventDefault() has been called
          requestAnimationFrame(() => {
            if (isFocused && isFirst && !e.defaultPrevented) {
              fnRef.current()
            }
          })
        },
      )
    })

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe())
    }
  }, [navigation, route.key])
}
