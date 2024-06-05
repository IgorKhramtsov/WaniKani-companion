import { RollOutRight } from '@/src/animations/roll'
import { Colors } from '@/src/constants/Colors'
import typography from '@/src/constants/typography'
import { useAppDispatch, useAppSelector } from '@/src/hooks/redux'
import {
  init,
  reset,
  selectCurrentTask,
  selectNextTask,
  selectProgress,
  selectStatus,
} from '@/src/redux/reviewSlice'
import { Link, useLocalSearchParams } from 'expo-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Keyboard, Pressable, Text, View } from 'react-native'
import { TextInput } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { CardView } from './CardView'
import {
  completionCopywritings,
  completionTitleCopywritings,
  getRandomCopywritings,
} from './utils'
import { useSubjectCache } from '@/src/hooks/useSubjectCache'
import { FullPageLoading } from '@/src/components/FullPageLoading'

export default function Index() {
  const dispatch = useAppDispatch()
  const params = useLocalSearchParams<{ subjects: string }>().subjects
  const { styles } = useStyles(stylesheet)
  const currentInputRef = useRef<TextInput>(null)
  const nextInputRef = useRef<TextInput>(null)
  const [currentCopywritings, setCurrentCopywritings] = useState<{
    title: string
    copy: string
  }>({ title: completionTitleCopywritings[0], copy: completionCopywritings[0] })

  const subjectIds = useMemo(() => {
    console.log('[review] Processing params: ', params)
    return params?.split(',').map(el => parseInt(el))
  }, [params])
  console.log('[review] subjectIds: ', subjectIds)
  const { subjects, subjectSliceStatus } = useSubjectCache(subjectIds)
  const reviewSliceStatus = useAppSelector(selectStatus)
  const currentTask = useAppSelector(selectCurrentTask)
  const nextTask = useAppSelector(selectNextTask)
  const progress = useAppSelector(selectProgress)
  const progressValue = useSharedValue(0)
  const [isKeyboardVisible, setKeyboardVisible] = useState(false)

  useEffect(() => {
    progressValue.value = withSpring(progress, {
      duration: 300,
      dampingRatio: 1.5,
      stiffness: 300,
    })
  }, [progress, progressValue])

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value}%`,
  }))

  useEffect(() => {
    // TODO: find a way to prevent exit animation from happening upon entering
    // the review page. (Right now because of the reset - it happens)
    dispatch(reset())
  }, [dispatch])

  useEffect(() => {
    const randomCopywriting = getRandomCopywritings()
    setCurrentCopywritings(randomCopywriting)
  }, [])

  useEffect(() => {
    console.log(
      '[review] Sending SubjectsFetched action with ',
      subjects.length,
    )
    dispatch(init(subjects))
  }, [subjects, dispatch])

  // Show keyboard after a timeout to avoid a bug with the keyboard being shown
  // during the page entering animation.
  useEffect(() => {
    if (currentTask !== undefined) {
      // Adjust the delay time to match the duration of your animation
      const timeoutId = setTimeout(() => {
        currentInputRef.current?.focus()
      }, 500)

      return () => clearTimeout(timeoutId)
    }
  }, [currentTask, currentInputRef])

  // Keep track of keyboard state
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true),
    )
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false),
    )

    return () => {
      keyboardDidHideListener.remove()
      keyboardDidShowListener.remove()
    }
  }, [])

  if (subjectIds === undefined) {
    return <Text>Couldn't get parameters</Text>
  }

  // TODO: The cursor for TextInput is not in the middle when placeholder is in
  // place. To fix that custom placeholder should be implemented

  if (reviewSliceStatus === 'loading' || subjectSliceStatus === 'loading') {
    return <FullPageLoading />
  }

  return (
    <Pressable
      style={{ height: '100%' }}
      // Disable pressable when keyboard is not shown. This is to avoid issue
      // with scrollable for info view of card
      disabled={!isKeyboardVisible}
      onPress={Keyboard.dismiss}
      accessible={false}>
      <View style={styles.progressIndicatorContainer}>
        <Animated.View
          style={[styles.progressIndicator, progressAnimatedStyle]}>
          <Animated.View style={[styles.progressIndicatorHighlight]} />
        </Animated.View>
      </View>
      <View style={styles.pageContainer}>
        {nextTask && (
          // Show next task in order to keep the keyboard always open (we focus
          // the next task's input node when current one is leaving the scene)
          <Animated.View
            pointerEvents='none'
            key={nextTask.subject.id + nextTask.type + nextTask.numberOfErrors}
            style={{
              height: '100%',
              width: '100%',
              zIndex: 0,
              position: 'absolute',
              transform: [{ translateY: -4 }, { translateX: 3 }],
            }}>
            <CardView task={nextTask} textInputRef={nextInputRef} />
          </Animated.View>
        )}
        {currentTask && (
          <Animated.View
            key={
              currentTask.subject.id +
              currentTask.type +
              currentTask.numberOfErrors
            }
            style={{
              height: '100%',
              width: '100%',
              position: 'absolute',
            }}
            exiting={RollOutRight.duration(500)}>
            <CardView
              task={currentTask}
              textInputRef={currentInputRef}
              onSubmit={() => nextInputRef.current?.focus()}
            />
          </Animated.View>
        )}
        {!currentTask && (
          <View style={styles.completionCard}>
            <Text style={styles.completionTextTitle}>
              {currentCopywritings.title}
            </Text>
            <View style={{ height: 16 }} />
            <Text style={styles.completionText}>
              {currentCopywritings.copy}
            </Text>
            <View style={{ height: 32 }} />
            <Link href='..' asChild>
              <Pressable style={styles.completionButton}>
                <Text style={styles.completionButtonText}>Done</Text>
              </Pressable>
            </Link>
          </View>
        )}
      </View>
    </Pressable>
  )
}

const stylesheet = createStyleSheet({
  progressIndicatorContainer: {
    height: 20,
    backgroundColor: Colors.generalDarkGray,
    borderRadius: 10,
    marginHorizontal: 8,
    marginTop: 8,
  },
  progressIndicator: {
    height: 20,
    backgroundColor: Colors.correctGreen,
    borderRadius: 10,
  },
  progressIndicatorHighlight: {
    marginTop: 4,
    marginHorizontal: 10,
    height: 8,
    backgroundColor: Colors.getLighter(Colors.correctGreen, 5),
    borderRadius: 16,
  },
  pageContainer: {
    flex: 1,
    margin: 30,
    justifyContent: 'center',
  },
  completionCard: {
    backgroundColor: Colors.blue,
    padding: 30,
    borderRadius: 8,
  },
  completionTextTitle: {
    ...typography.heading,
    color: 'white',
  },
  completionText: {
    ...typography.body,
    lineHeight: typography.body.fontSize * 1.22,
    color: 'white',
  },
  completionButton: {
    backgroundColor: 'white',
    alignItems: 'center',
    borderRadius: 3,
    padding: 8,
    marginHorizontal: 16,
  },
  completionButtonText: {
    ...typography.body,
    color: Colors.blue,
  },
})
