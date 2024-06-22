// NOTE: AI generated

import { uniqueId } from 'lodash'
import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from 'react'
import { View, LayoutChangeEvent } from 'react-native'
import Animated, {
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  useSharedValue,
  runOnJS,
  Easing,
} from 'react-native-reanimated'

interface EmojiData {
  id: string
  emoji: string
  startXPosition: number
  startYPosition: number
}

const getRandomValue = (min: number, max: number) =>
  Math.random() * (max - min) + min
const getRotationInDeg = (deg: number) => `${deg}deg`
const getRandomRotation = () => {
  const angle = getRandomValue(20, 90)
  return angle * (Math.random() > 0.5 ? -1 : 1)
}

const FloatingEmoji: React.FC<{
  data: EmojiData
  onAnimationComplete: (id: string) => void
}> = ({
  data: { startYPosition, startXPosition, emoji, id },
  onAnimationComplete,
}) => {
  const translateY = useSharedValue(startYPosition)
  const opacity = useSharedValue(1)
  const scale = useSharedValue(1)
  const rotate = useSharedValue('0deg')

  const startAnimation = useCallback(() => {
    const translateYEnd1 = startYPosition - getRandomValue(80, 120)
    const translateYEnd2 = startYPosition - getRandomValue(180, 220)
    const scaleEnd1 = getRandomValue(1.2, 1.5)
    const scaleEnd2 = getRandomValue(1.7, 2)
    const rotateEnd1 = getRandomRotation()
    const rotateEnd2 = rotateEnd1 + getRandomValue(-40, 40)
    const opacityDelay = getRandomValue(800, 1200)
    const easing = Easing.out(Easing.quad)

    translateY.value = withSequence(
      withTiming(translateYEnd1, {
        duration: getRandomValue(900, 1100),
        easing: Easing.out(Easing.cubic),
      }),
      withTiming(translateYEnd2, {
        duration: getRandomValue(900, 1100),
        easing: Easing.in(Easing.cubic),
      }),
    )
    opacity.value = withDelay(
      opacityDelay,
      withTiming(0, { duration: getRandomValue(900, 1100) }, () => {
        runOnJS(onAnimationComplete)(id)
      }),
    )
    scale.value = withSequence(
      withTiming(scaleEnd1, {
        duration: getRandomValue(900, 1100),
        easing: easing,
      }),
      withTiming(scaleEnd2, {
        duration: getRandomValue(900, 1100),
        easing: easing,
      }),
    )
    rotate.value = withSequence(
      withTiming(getRotationInDeg(rotateEnd1), {
        duration: getRandomValue(900, 1100),
        easing: easing,
      }),
      withTiming(getRotationInDeg(rotateEnd2), {
        duration: getRandomValue(900, 1100),
        easing: easing,
      }),
    )
  }, [
    startYPosition,
    translateY,
    opacity,
    scale,
    rotate,
    onAnimationComplete,
    id,
  ])

  React.useEffect(() => {
    startAnimation()
  }, [startAnimation])

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: startXPosition,
    bottom: 0,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: rotate.value },
    ],
    opacity: opacity.value,
  }))

  return <Animated.Text style={animatedStyle}>{emoji}</Animated.Text>
}

// Duplicated emojis increase the chance of them being selected
const EMOJI_SETS = [
  ['🔥', '🚀', '🔥'],
  ['👍', '😎', '🥳', '👍'],
  ['👍', '✨', '✨', '🌟'],
  ['✨'], // A bit boring as the stars is pretty empty emoji. Revisit later.
  ['👍', '✨', '🌟', '🤩'],
  ['🎉', '🥳', '✨'],
]

export interface FloatingEmojisRef {
  spawnEmojis: (n: number) => void
}

interface FloatingEmojisProps {
  children: React.ReactNode
}

const FloatingEmojis = forwardRef<FloatingEmojisRef, FloatingEmojisProps>(
  ({ children }, ref) => {
    const [emojis, setEmojis] = useState<EmojiData[]>([])
    const [wrapperWidth, setWrapperWidth] = useState(0)
    const [wrapperHeight, setWrapperHeight] = useState(0)

    const spawnEmojis = (count: number) => {
      const selectedSet =
        EMOJI_SETS[Math.floor(Math.random() * EMOJI_SETS.length)]
      const newEmojis: EmojiData[] = Array.from({ length: count }, () => ({
        id: uniqueId(), // Ensure unique IDs
        emoji: selectedSet[Math.floor(Math.random() * selectedSet.length)],
        startXPosition: Math.random() * wrapperWidth,
        startYPosition: Math.random() * (wrapperHeight / 2), // Random initial Y position
      }))
      setEmojis(prevEmojis => [...prevEmojis, ...newEmojis])
    }
    const removeEmoji = useCallback(
      (id: string) => {
        setEmojis(prevEmojis => prevEmojis.filter(emoji => emoji.id !== id))
      },
      [setEmojis],
    )

    useImperativeHandle(ref, () => ({
      spawnEmojis,
    }))

    const onLayout = (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout
      setWrapperWidth(width)
      setWrapperHeight(height)
    }

    return (
      <View onLayout={onLayout} style={{ position: 'relative' }}>
        {children}
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
            pointerEvents: 'none',
          }}>
          {emojis.map(emoji => (
            <FloatingEmoji
              key={emoji.id}
              data={emoji}
              onAnimationComplete={removeEmoji}
            />
          ))}
        </View>
      </View>
    )
  },
)

FloatingEmojis.displayName = 'FloatingEmojis'

export default FloatingEmojis
