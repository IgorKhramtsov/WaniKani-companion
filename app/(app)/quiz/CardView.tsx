import { Colors } from '@/src/constants/Colors'
import typography from '@/src/constants/typography'
import { useAppDispatch } from '@/src/hooks/redux'
import {
  QuizTask,
  answeredCorrectly,
  answeredIncorrectly,
} from '@/src/redux/quizSlice'
import { SubjectUtils } from '@/src/types/subject'
import { useCallback, useEffect, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native'
import { TextInput } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { AntDesign, FontAwesome } from '@expo/vector-icons'
import { checkAnswer } from '@/src/utils/answerChecker/answerChecker'
import { questionTypeAndResponseMatch } from '@/src/utils/answerChecker/checkAnswerUtils'
import { CardInputVariant } from './CardInputVariant'
import { ReadingPage } from '@/src/components/ReadingPage'
import { MeaningPage } from '@/src/components/MeaningPage'
import { LinearGradient } from 'expo-linear-gradient'

// Wrapper that will force component to be re-rendered even when the state is
// the same. This allows to show incorrect animation for subsequent warnings.
export type TaskStateWrapper = {
  state: TaskState
}
type TaskState = 'correct' | 'incorrect' | 'notAnswered' | 'warning'
type CardState = 'input' | 'viewInfo'

type CardProps = {
  task: QuizTask
  textInputRef: React.RefObject<TextInput>
  onSubmit?: () => void
}

const flipCardAnimationDuration = 500

export const CardView = ({ task, textInputRef, onSubmit }: CardProps) => {
  const { styles } = useStyles(stylesheet)
  const dispatch = useAppDispatch()

  const [taskState, setTaskState] = useState<TaskStateWrapper>({
    state: 'notAnswered',
  })
  const [hint, setHint] = useState<string | undefined>(undefined)
  const [cardState, setCardState] = useState<CardState>('input')
  const rotateY = useSharedValue(0)

  const frontAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotateY: `${rotateY.value}deg` }, { perspective: 1200 }],
      opacity: rotateY.value < 90 ? 1 : 0,
    }
  })

  const backAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotateY: `${rotateY.value + 180}deg` },
        { perspective: 1200 },
      ],
      opacity: rotateY.value > 90 ? 1 : 0,
    }
  })

  useEffect(() => {
    if (cardState === 'viewInfo') {
      rotateY.value = withTiming(180, { duration: flipCardAnimationDuration })
    } else {
      rotateY.value = withTiming(0, { duration: flipCardAnimationDuration })
    }
  }, [cardState, rotateY])

  const shakeAnimation = useSharedValue(0)

  const waveInfoButton = useCallback(
    () =>
      (shakeAnimation.value = withRepeat(
        withSequence(
          withTiming(-10, { duration: 65 }),
          withTiming(10, { duration: 65 }),
          withTiming(0, { duration: 65 }),
        ),
        2,
      )),
    [shakeAnimation],
  )
  const animatedInfoButtonStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${shakeAnimation.value}deg` }],
  }))

  useEffect(() => {
    if (taskState.state === 'incorrect') {
      waveInfoButton()
    }
  }, [taskState, waveInfoButton])

  const submit = useCallback(
    (input: string) => {
      // Second submit will actually submit the task and move to the next (the
      //  same as web app works)
      if (taskState.state === 'correct' || taskState.state === 'incorrect') {
        const args = {
          id: task.subject.subject.id,
          type: task.type,
        }
        if (taskState.state === 'incorrect') {
          dispatch(answeredIncorrectly(args))
        } else {
          dispatch(answeredCorrectly(args))
        }
        onSubmit?.()
        return
      }
      if (input.length === 0) return

      if (!questionTypeAndResponseMatch(task.type, input)) {
        setTaskState({ state: 'warning' })
        return
      }

      const checkResult = checkAnswer({
        taskType: task.type,
        input,
        subject: task.subject,
        userSynonyms: [],
      })

      if (checkResult.status === 'correct') {
        setTaskState({ state: 'correct' })
      } else if (checkResult.status === 'correctWithHint') {
        setTaskState({ state: 'correct' })
        setHint(checkResult.message)
      } else if (checkResult.status === 'incorrect') {
        setTaskState({ state: 'incorrect' })
      } else if (checkResult.status === 'hint') {
        setTaskState({ state: 'warning' })
        setHint(checkResult.message)
      }
    },
    [dispatch, task, taskState, onSubmit],
  )

  const switchCard = useCallback(() => {
    console.log('switchCard')
    setCardState(cardState === 'input' ? 'viewInfo' : 'input')
  }, [cardState])

  const subject = task.subject
  const subjectColor = SubjectUtils.getAssociatedColor(subject.subject)
  const infoButtonVisible =
    taskState.state === 'correct' || taskState.state === 'incorrect'

  const turnBackButton = (
    <View style={styles.cardViewActionContainerBack}>
      <Pressable
        style={{ alignItems: 'center', zIndex: 31 }}
        onPress={switchCard}>
        <View style={{ transform: [{ rotateZ: '180deg' }] }}>
          <FontAwesome name='share' size={24} color='black' />
        </View>
      </Pressable>
    </View>
  )

  const nextButton = (
    <View style={styles.viewInfoNextButtonContainer}>
      <View style={{ height: 16 }} />
      <Pressable style={styles.viewInfoNextButton} onPress={() => submit('')}>
        <Text style={styles.viewInfoNextButtonText}>Next</Text>
      </Pressable>
    </View>
  )

  return (
    <View style={{ flexGrow: 1 }}>
      <Animated.View
        pointerEvents={cardState === 'input' ? 'auto' : 'none'}
        style={[
          frontAnimatedStyle,
          styles.card,
          { backgroundColor: subjectColor },
        ]}>
        <LinearGradient
          colors={[subjectColor, Colors.getDarker(subjectColor, 10)]}
          style={[styles.card, { height: '100%' }]}>
          <Animated.View
            style={[animatedInfoButtonStyle, styles.cardViewActionContainer]}>
            {infoButtonVisible && (
              <Pressable
                style={{ alignItems: 'center', zIndex: 31 }}
                onPress={switchCard}>
                <AntDesign name='infocirlceo' size={24} color='white' />
              </Pressable>
            )}
          </Animated.View>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 0 }}>
            <CardInputVariant
              task={task}
              submit={submit}
              taskState={taskState}
              textInputRef={textInputRef}
              hint={hint}
            />
          </KeyboardAvoidingView>
        </LinearGradient>
      </Animated.View>
      <Animated.View
        pointerEvents={cardState === 'viewInfo' ? 'auto' : 'none'}
        style={[backAnimatedStyle, styles.card, { backgroundColor: 'white' }]}>
        <View style={styles.viewInfoContainer}>
          {task.type === 'reading' && (
            <ReadingPage
              topContent={turnBackButton}
              bottomContent={nextButton}
              subject={task.subject.subject}
            />
          )}
          {task.type === 'meaning' && (
            <MeaningPage
              topContent={turnBackButton}
              // TODO: use another page layout when it is implemented
              // (subjects library view)
              showMeaning={true}
              bottomContent={nextButton}
              subject={task.subject.subject}
            />
          )}
        </View>
      </Animated.View>
    </View>
  )
}

const stylesheet = createStyleSheet({
  card: {
    // TODO: make responsive
    // flexGrow: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    shadowColor: 'black',
    shadowRadius: 12,
    shadowOpacity: 0.3,
    zIndex: 1,
  },
  cardViewActionContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 5,
  },
  cardViewActionContainerBack: {
    alignItems: 'flex-end',
    zIndex: 5,
  },
  viewInfoContainer: {
    flex: 1,
  },
  viewInfoNextButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewInfoNextButton: {
    backgroundColor: Colors.blue,
    alignItems: 'center',
    padding: 8,
    minWidth: '100%',
    borderRadius: 4,
  },
  viewInfoNextButtonText: {
    ...typography.callout,
    color: 'white',
    textTransform: 'uppercase',
  },
})
