// NOTE: AI generated

import React, {
  useImperativeHandle,
  forwardRef,
  useCallback,
  useState,
  ReactNode,
} from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated'

interface AnimatedToastWrapperProps {
  children: React.ReactNode
  containerStyle?: ViewStyle
  toastStyle?: ViewStyle
}

export interface AnimatedToastWrapperRef {
  show: (content: ReactNode) => void
}

const AnimatedToastWrapper = forwardRef<
  AnimatedToastWrapperRef,
  AnimatedToastWrapperProps
>(({ children, containerStyle, toastStyle }, ref) => {
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(0)
  const [toastContent, setToastContent] = useState<ReactNode | null>(null)

  const show = useCallback(
    (content: ReactNode) => {
      setToastContent(content)

      // Reset position
      translateY.value = 0

      // Animation sequence
      opacity.value = withSequence(
        // Fade in
        withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) }),
        // Stay visible
        withTiming(1, { duration: 500 }),
        // Fade out
        withDelay(
          200,
          withTiming(
            0,
            { duration: 500, easing: Easing.in(Easing.ease) },
            finished => {
              if (finished) {
                runOnJS(setToastContent)(null)
              }
            },
          ),
        ),
      )

      translateY.value = withSequence(
        // Float to initial position
        withTiming(-50, { duration: 300, easing: Easing.out(Easing.ease) }),
        // Stay in position
        withTiming(-50, { duration: 500 }),
        // Float higher and disappear
        withTiming(-100, { duration: 700, easing: Easing.in(Easing.ease) }),
      )
    },
    [opacity, translateY],
  )

  useImperativeHandle(ref, () => ({
    show,
  }))

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }))

  return (
    <View style={[styles.container, containerStyle]}>
      {children}
      {toastContent && (
        <Animated.View
          style={[styles.toastContainer, toastStyle, animatedStyle]}>
          {toastContent}
        </Animated.View>
      )}
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    minWidth: 200,
  },
  toastContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    alignItems: 'center',
  },
})

AnimatedToastWrapper.displayName = 'AnimatedToastWrapper'

export default AnimatedToastWrapper
