import { RollOutRight } from '@/src/animations/roll'
import { Colors } from '@/src/constants/Colors'
import typography from '@/src/constants/typography'
import { useAppDispatch, useAppSelector } from '@/src/hooks/redux'
import {
  QuizInitElement,
  init,
  markTaskPairAsReported,
  selectCurrentTask,
  selectNextTask,
  selectProgress,
  selectTaskPairsForReport,
  selectWrapUpEnabled,
  selectWrapUpRemainingTasks,
  toggleWrapUp,
} from '@/src/redux/quizSlice'
import { Link, router, useNavigation } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Keyboard, Pressable, Text, View } from 'react-native'
import { TextInput } from 'react-native-gesture-handler'
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { CardView } from './CardView'
import { FullPageLoading } from '@/src/components/FullPageLoading'
import { QuizMode } from '@/src/types/quizType'
import {
  useCreateReviewMutation,
  useStartAssignmentMutation,
} from '@/src/api/wanikaniApi'
import { CreateReviewParams } from '@/src/types/createReviewParams'
import { MenuAction, MenuView } from '@react-native-menu/menu'
import { AntDesign, FontAwesome6 } from '@expo/vector-icons'
import { useSettings } from '@/src/hooks/useSettings'
import { clamp } from 'lodash'
import { appStyles } from '@/src/constants/styles'
import { SafeAreaView } from 'react-native-safe-area-context'
import { completionTitleCopywritings, getRandomCopywritings } from './utils'
import { useGetAssignmentsQuery } from '@/src/api/localDb/assignment'
import { useGetSubjectsQuery } from '@/src/api/localDb/subject'
import * as Sentry from '@sentry/react-native'

interface BaseProps {
  mode: QuizMode
}

// TODO: do not tie together quiz mode and assignment/subject
interface SubjectProps extends BaseProps {
  mode: 'quiz'
  subjectIds: number[]
}

interface AssignmentProps extends BaseProps {
  mode: 'review' | 'lessonsQuiz'
  assignmentIds: number[]
  moreLessonIds?: number[]
}

const isAssignmentProps = (
  props: SubjectProps | AssignmentProps,
): props is AssignmentProps => {
  return props.mode !== 'quiz'
}
const isSubjectProps = (
  props: SubjectProps | AssignmentProps,
): props is SubjectProps => {
  return props.mode === 'quiz'
}

export const QuizPage = (props: SubjectProps | AssignmentProps) => {
  const { styles } = useStyles(stylesheet)
  const dispatch = useAppDispatch()
  const navigation = useNavigation()
  const { settings } = useSettings()
  const currentInputRef = useRef<TextInput>(null)
  const nextInputRef = useRef<TextInput>(null)

  let assignmentIds = useMemo(() => {
    if (isAssignmentProps(props)) {
      return props.assignmentIds
    }
    return []
  }, [props])

  let moreLessonIds = useMemo(() => {
    if (isAssignmentProps(props)) {
      return props.moreLessonIds ?? []
    }
    return []
  }, [props])

  const subjectIds = useMemo(() => {
    if (isSubjectProps(props)) {
      return props.subjectIds
    }
    return []
  }, [props])

  const { completionCopy, completionTitle } = useMemo(() => {
    switch (props.mode) {
      case 'lessonsQuiz':
        return {
          completionCopy:
            moreLessonIds.length > 0
              ? 'You have completed all the lessons in this batch.\n Do you want another one?'
              : 'You have completed all for today. Return tomorrow for the new portion!',
          completionTitle: completionTitleCopywritings[0],
        }
      case 'review':
      default:
        const copywritings = getRandomCopywritings()
        return {
          completionCopy: copywritings.copy,
          completionTitle: copywritings.title,
        }
    }
  }, [moreLessonIds.length, props.mode])

  const doneCopy = useMemo(
    () => (moreLessonIds.length > 0 ? "That's enough for now" : 'Done'),
    [moreLessonIds],
  )

  const { data: assignments, isLoading: areAssignmentsLoading } =
    useGetAssignmentsQuery(assignmentIds, {
      skip: isSubjectProps(props),
    })

  const { data: subjects, isLoading: areSubjectsLoading } = useGetSubjectsQuery(
    subjectIds,
    { skip: !isSubjectProps(props) },
  )

  const subjectsData = useMemo(() => {
    return (subjects ?? [])
      .map<QuizInitElement>(e => ({
        assignmentId: undefined,
        subjectId: e.id,
        subjectType: e.type,
      }))
      .concat(
        (assignments ?? []).map<QuizInitElement>(e => ({
          assignmentId: e.id,
          subjectId: e.subject_id,
          subjectType: e.subject_type,
        })),
      )
  }, [subjects, assignments])

  const wrapUpEnabled = useAppSelector(selectWrapUpEnabled)
  const wrapUpRemaningTasks = useAppSelector(selectWrapUpRemainingTasks)
  const currentTask = useAppSelector(selectCurrentTask)
  const nextTask = useAppSelector(selectNextTask)
  const progress = useAppSelector(selectProgress)
  const taskPairsForReport = useAppSelector(selectTaskPairsForReport)
  const [startAssignment] = useStartAssignmentMutation()
  const [createReview] = useCreateReviewMutation()
  // Prevent old slice state from being used before we hydrated it with new
  // data.
  const [initiated, setInitiated] = useState(false)

  const isLoading = useMemo(() => {
    console.log(
      '[QuizPage]: isLoading',
      areAssignmentsLoading,
      areSubjectsLoading,
      initiated,
    )
    return areAssignmentsLoading || areSubjectsLoading || !initiated
  }, [areAssignmentsLoading, areSubjectsLoading, initiated])

  const progressValue = useSharedValue(0)
  const [isKeyboardVisible, setKeyboardVisible] = useState(false)

  const isReadyToInit = useMemo(() => {
    return subjectsData.length > 0
  }, [subjectsData])

  useEffect(() => {
    // When new report is created, the api slice will invalidate Reviews cache
    // by fetching them again, this will trigger reviews selector which will
    // trigger this function and re-initiate the quiz slice in the middle of
    // review. This is a workaround to not initialize it twice.
    if (initiated) return
    // We don't want to initialize the slice if we don't have all the data yet.
    if (!isReadyToInit) return

    console.log('[QuizPage]: dispatching init for', props.mode)
    dispatch(init({ elements: subjectsData, mode: props.mode }))
    setInitiated(true)
  }, [subjectsData, dispatch, assignments, props, initiated, isReadyToInit])

  const menuActions = useMemo(() => {
    const actions: MenuAction[] = []
    actions.push({
      id: 'wrap-up',
      attributes: {
        disabled: wrapUpRemaningTasks.length === 0,
      },
      title: wrapUpEnabled
        ? 'Cancel Wrap Up'
        : `Wrap Up (${wrapUpRemaningTasks.length})`,
    })
    return actions
  }, [wrapUpEnabled, wrapUpRemaningTasks.length])

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <MenuView
          onPressAction={({ nativeEvent }) => {
            if (nativeEvent.event === 'wrap-up') {
              dispatch(toggleWrapUp())
            }
          }}
          actions={menuActions}>
          <FontAwesome6 name='ellipsis' size={24} color='black' />
        </MenuView>
      ),
    })
  }, [
    menuActions,
    dispatch,
    navigation,
    wrapUpEnabled,
    wrapUpRemaningTasks.length,
  ])

  useEffect(() => {
    for (const taskPair of taskPairsForReport) {
      switch (props.mode) {
        case 'lessonsQuiz':
          const assignmentId = taskPair[0].assignmentId
          if (assignmentId === undefined) {
            if (__DEV__) {
              throw new Error('assignmentId is undefined')
            }
            return
          }
          startAssignment(assignmentId)
          break
        case 'review':
          const readingTask = taskPair.find(task => task.type === 'reading')
          const meaningTask = taskPair.find(task => task.type === 'meaning')
          if (meaningTask === undefined) {
            if (__DEV__) {
              throw new Error('meaningTask is undefined')
            }
            return
          }
          if (
            meaningTask.subjectType === 'kanji' ||
            meaningTask.subjectType === 'vocabulary'
          ) {
            if (readingTask === undefined) {
              if (__DEV__) {
                throw new Error(
                  'readingTask is undefined for kanji or vocabulary',
                )
              }
              return
            }
          }
          const params: CreateReviewParams = {
            subject_id: meaningTask.subjectId,
            incorrect_meaning_answers: meaningTask.numberOfErrors,
            incorrect_reading_answers: readingTask?.numberOfErrors ?? 0,
          }
          // createReview(params).then(result => {
          //   if (result.error === undefined) {
          //     console.log('Review created successfully')
          //     dispatch(markTaskPairAsReported({ taskPair: taskPair }))
          //   } else {
          //     console.error('Error reporting task pair', result.error)
          //   }
          // })
          break
      }
    }
  }, [createReview, startAssignment, dispatch, props, taskPairsForReport])

  useEffect(() => {
    progressValue.value = withSpring(clamp(progress * 0.9 + 10, 0, 100), {
      duration: 300,
      dampingRatio: 1.5,
      stiffness: 300,
    })
  }, [progress, progressValue])

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value}%`,
  }))

  // Show keyboard after a timeout to avoid a bug with the keyboard being shown
  // during the page entering animation.
  // TODO: depend on focus instead of keyboard. This way you can use it
  // correctly in keyboardless mode (emulator)
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

  const transitionDuration = 500
  const nextTaskTransformStyle = {
    translateY: 32,
    scale: 0.9,
  }

  const transitionProgress = useSharedValue(0)

  useEffect(() => {
    // Trigger transition when currentTask changes
    transitionProgress.value = 0
    transitionProgress.value = withTiming(1, { duration: transitionDuration })
  }, [currentTask, transitionProgress])
  useEffect(() => {
    Sentry.startIdleNavigationSpan({
      name: 'quiz/cardView',
      op: 'navigation',
    })
  })

  const closeFunc = useCallback(() => {
    router.back()
  }, [])

  const currentTaskStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            transitionProgress.value,
            [0, 1],
            [nextTaskTransformStyle.translateY, 0],
          ),
        },
        {
          scale: interpolate(
            transitionProgress.value,
            [0, 1],
            [nextTaskTransformStyle.scale, 1],
          ),
        },
      ],
    }
  })

  if (isLoading) {
    return <FullPageLoading />
  }

  return (
    <SafeAreaView edges={['top']}>
      <Pressable
        style={{ height: '100%' }}
        // Disable pressable when keyboard is not shown. This is to avoid issue
        // with scrollable for info view of card
        disabled={!isKeyboardVisible}
        onPress={Keyboard.dismiss}
        accessible={false}>
        <View style={styles.topBarContainer}>
          <Pressable onPress={closeFunc}>
            <View style={styles.topBarCloseButton}>
              <AntDesign
                name={props.mode === 'lessonsQuiz' ? 'arrowleft' : 'close'}
                size={32}
                color={Colors.gray55}
              />
            </View>
          </Pressable>
          {currentTask !== undefined && (
            <View style={styles.progressIndicatorContainer}>
              <Animated.View
                style={[styles.progressIndicator, progressAnimatedStyle]}>
                <Animated.View style={[styles.progressIndicatorHighlight]} />
              </Animated.View>
            </View>
          )}
          {currentTask !== undefined && (
            <MenuView
              style={styles.topBarMenu}
              onPressAction={({ nativeEvent }) => {
                if (nativeEvent.event === 'wrap-up') {
                  dispatch(toggleWrapUp())
                }
              }}
              actions={menuActions}>
              <FontAwesome6 name='ellipsis' size={24} color={Colors.gray55} />
            </MenuView>
          )}
        </View>
        <View style={styles.pageContainer}>
          {nextTask && (
            // Show next task in order to keep the keyboard always open (we focus
            // the next task's input node when current one is leaving the scene)
            // NOTE: The sub-tree should be the same as for the currentTask to
            // support seamless focus move for the keyboard.
            <Animated.View
              pointerEvents='none'
              key={nextTask.subjectId + nextTask.type + nextTask.numberOfErrors}
              style={{
                height: '100%',
                width: '100%',
                zIndex: 0,
                position: 'absolute',
                transform: [
                  { translateY: nextTaskTransformStyle.translateY },
                  { scale: nextTaskTransformStyle.scale },
                ],
              }}>
              <Animated.View>
                <CardView
                  active={false}
                  task={nextTask}
                  textInputRef={nextInputRef}
                />
              </Animated.View>
            </Animated.View>
          )}
          {currentTask && (
            <Animated.View
              key={
                currentTask.subjectId +
                currentTask.type +
                currentTask.numberOfErrors
              }
              style={{
                height: '100%',
                width: '100%',
                position: 'absolute',
              }}
              exiting={RollOutRight.duration(transitionDuration)}>
              <Animated.View
                // To avoid conflicts with styling and exiting animation - we
                // need to introduce separate AnimatedViews for them
                style={[
                  {
                    height: '100%',
                    width: '100%',
                    position: 'absolute',
                  },
                  currentTaskStyle,
                ]}>
                <CardView
                  active={true}
                  task={currentTask}
                  textInputRef={currentInputRef}
                  onSubmit={() => nextInputRef.current?.focus()}
                />
              </Animated.View>
            </Animated.View>
          )}
          {!currentTask && completionTitle && completionCopy && (
            <View style={{ height: '100%', justifyContent: 'center' }}>
              <View style={styles.completionCard}>
                <Text style={styles.completionTextTitle}>
                  {completionTitle}
                </Text>
                <View style={{ height: 16 }} />
                <Text style={styles.completionText}>{completionCopy}</Text>
                <View style={{ height: 32 }} />
                <Link href='/home' asChild>
                  <Pressable style={styles.completionButton}>
                    <Text style={styles.completionButtonText}>{doneCopy}</Text>
                  </Pressable>
                </Link>
                {moreLessonIds.length > 0 && (
                  <>
                    <View style={{ height: 12 }} />
                    <Link
                      href={{ pathname: '/lessons', params: { moreLessonIds } }}
                      asChild>
                      <Pressable style={styles.completionButton}>
                        <Text style={styles.completionButtonText}>
                          Yes, Please!
                        </Text>
                      </Pressable>
                    </Link>
                  </>
                )}
              </View>
            </View>
          )}
        </View>
      </Pressable>
    </SafeAreaView>
  )
}

const stylesheet = createStyleSheet({
  topBarContainer: {
    ...appStyles.row,
  },
  topBarCloseButton: {
    marginLeft: 12,
    marginRight: 4,
  },
  topBarMenu: {
    marginRight: 12,
    marginLeft: 8,
  },
  progressIndicatorContainer: {
    flex: 1,
    height: 20,
    backgroundColor: Colors.grayDA,
    borderRadius: 10,
    marginHorizontal: 8,
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
  pageContainerDebug: {
    height: '100%',
  },
  pageContainer: {
    flex: 1,
    margin: 30,
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
