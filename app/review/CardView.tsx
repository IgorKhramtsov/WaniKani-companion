import { Colors } from '@/src/constants/Colors'
import typography from '@/src/constants/typography'
import { useAppDispatch } from '@/src/hooks/redux'
import {
  ReviewTask,
  ReviewTaskUtils,
  answeredCorrectly,
  answeredIncorrectly,
} from '@/src/redux/reviewSlice'
import { SubjectUtils } from '@/src/types/subject'
import { StringUtils } from '@/src/utils/stringUtils'
import { Fragment, useCallback, useEffect, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native'
import { TextInput } from 'react-native-gesture-handler'
import Animated, {
  StretchInY,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { isMeaningCorrect, isReadingCorrect } from './utils'
import { AntDesign, FontAwesome } from '@expo/vector-icons'
import { MeaningPage } from '../lessons/MeaningPage'
import { ReadingPage } from '../lessons/ReadingPage'
import wanakana from 'wanakana'

type TaskState = 'correct' | 'incorrect' | 'notAnswered'
type CardState = 'input' | 'viewInfo'

type CardProps = {
  task: ReviewTask
  textInputRef: React.RefObject<TextInput>
  onSubmit?: () => void
}

const flipCardAnimationDuration = 500

export const CardView = ({ task, textInputRef, onSubmit }: CardProps) => {
  const { styles } = useStyles(stylesheet)
  const dispatch = useAppDispatch()

  const [taskState, setTaskState] = useState<TaskState>('notAnswered')
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
    if (taskState === 'incorrect') {
      waveInfoButton()
    }
  }, [taskState, waveInfoButton])

  const submit = useCallback(
    (input: string) => {
      // Second submit will actually submit the task and move to the next (the
      //  same as web app works)
      if (taskState !== 'notAnswered') {
        const args = {
          id: task.subject.id,
          type: task.type,
        }
        if (taskState === 'incorrect') {
          dispatch(answeredIncorrectly(args))
        } else {
          dispatch(answeredCorrectly(args))
        }
        onSubmit?.()
        return
      }

      if (input.length === 0) return
      const result = ReviewTaskUtils.isReadingTask(task)
        ? isReadingCorrect(input, task.subject)
        : isMeaningCorrect(input, task.subject)
      if (result.status === 'correct') {
        setTaskState('correct')
      } else if (result.status === 'correctWithHint') {
        setTaskState('correct')
        setHint(result.hint)
      } else if (result.status === 'incorrect') {
        setTaskState('incorrect')
      } else if (result.status === 'hint') {
        setHint(result.hint)
      }
    },
    [dispatch, task, taskState, onSubmit],
  )

  const switchCard = useCallback(() => {
    console.log('switchCard')
    setCardState(cardState === 'input' ? 'viewInfo' : 'input')
  }, [cardState])

  const subject = task.subject
  const subjectColor = SubjectUtils.getAssociatedColor(subject)
  const infoButtonVisible = taskState !== 'notAnswered'

  const turnBackButton = (
    <View style={styles.cardViewActionContainerBack}>
      <Pressable
        style={{ alignItems: 'center', zIndex: 31 }}
        onPress={switchCard}>
        <View style={{ transform: [{ rotateZ: '180deg' }] }}>
          <FontAwesome name='share' size={32} color='black' />
        </View>
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
        <Animated.View
          style={[animatedInfoButtonStyle, styles.cardViewActionContainer]}>
          {infoButtonVisible && (
            <Pressable
              style={{ alignItems: 'center', zIndex: 31 }}
              onPress={switchCard}>
              <AntDesign name='questioncircleo' size={24} color='white' />
              <View style={{ height: 4 }} />
              <Text style={[styles.hintText, { color: 'white' }]}>
                need help
              </Text>
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
      </Animated.View>
      <Animated.View
        pointerEvents={cardState === 'viewInfo' ? 'auto' : 'none'}
        style={[backAnimatedStyle, styles.card, { backgroundColor: 'white' }]}>
        <View style={styles.viewInfoContainer}>
          {task.type === 'reading' && (
            <ReadingPage
              topContent={turnBackButton}
              bottomContent={<View style={{ height: 24 }} />}
              subject={task.subject}
            />
          )}
          {task.type === 'meaning' && (
            <MeaningPage
              topContent={turnBackButton}
              // TODO: use another page layout after it is implemented
              // (subjects library view)
              showMeaning={true}
              bottomContent={<View style={{ height: 24 }} />}
              subject={task.subject}
            />
          )}
        </View>
      </Animated.View>
    </View>
  )
}

type CardInputVariantProps = {
  textInputRef: React.RefObject<TextInput>
  submit: (input: string) => void
  taskState: TaskState
  task: ReviewTask
  hint: string | undefined
}

export const CardInputVariant = ({
  textInputRef,
  submit,
  taskState,
  task,
  hint,
}: CardInputVariantProps) => {
  const { styles } = useStyles(stylesheet)
  const [input, setInput] = useState('')

  const shakeAnimation = useSharedValue(0)

  const shakeInput = useCallback(
    () =>
      (shakeAnimation.value = withRepeat(
        withSequence(
          withTiming(15, { duration: 65 }),
          withTiming(0, { duration: 65 }),
        ),
        2,
      )),
    [shakeAnimation],
  )
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeAnimation.value }],
  }))

  useEffect(() => {
    // TODO: add confetti animation of emojis for correct answer
    // https://shopify.engineering/building-arrives-confetti-in-react-native-with-reanimated
    if (taskState === 'incorrect') {
      shakeInput()
    }
  }, [shakeInput, taskState])

  const setInputAndConvert = useCallback(
    (input: string) => {
      if (task.type === 'reading') {
        // IME mode is needed to avoid converting 'n' to 'ん' during the typing
        // so that it is possible to type na/ni etc.
        setInput(wanakana.toHiragana(input, { IMEMode: 'toHiragana' }))
      } else {
        setInput(input)
      }
    },
    [setInput, task.type],
  )

  const subject = task.subject
  const subjectName = SubjectUtils.getSubjectName(subject)
  const taskName = StringUtils.capitalizeFirstLetter(task.type.toString())
  const taskStateColor =
    taskState === 'correct'
      ? Colors.correctGreen
      : taskState === 'incorrect'
        ? Colors.incorrectRed
        : undefined
  // const taskStateTextColor = taskState === 'notAnswered' ? undefined : 'white'
  const taskStateTextColor = 'white'

  return (
    <Fragment>
      <View style={styles.cardTextContainer}>
        <Text style={styles.glyphText}>{subject.characters}</Text>
        <Text style={styles.taskText}>
          {subjectName}{' '}
          <Text style={[styles.taskText, { fontWeight: '500' }]}>
            {taskName}
          </Text>
        </Text>
      </View>
      <View style={{ height: 20 }} />
      {hint && (
        <Animated.View
          style={styles.hintContainer}
          entering={StretchInY.duration(200)}>
          <Text style={styles.hintText}>{hint}</Text>
        </Animated.View>
      )}
      <Animated.View style={[styles.textInputBox, animatedStyle]}>
        <TextInput
          ref={textInputRef}
          style={[
            styles.textInput,
            {
              backgroundColor: taskStateColor,
              color: taskStateTextColor,
            },
          ]}
          textAlign={'center'}
          onChangeText={input => setInputAndConvert(input)}
          onSubmitEditing={_ => submit(input)}
          value={input}
          blurOnSubmit={false}
          placeholder='Your Response'
          autoCorrect={false}
          autoComplete={'off'}
          // TODO: can not set semi-transparent color of placeholder text
          // (although it looks like the default color is semi-transparent)
        />
      </Animated.View>
    </Fragment>
  )
}

const stylesheet = createStyleSheet({
  glyphText: {
    ...typography.display1,
    color: 'white',
  },
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
    top: 12,
    right: 12,
    zIndex: 5,
  },
  cardViewActionContainerBack: {
    alignItems: 'flex-end',
    zIndex: 5,
  },
  viewInfoContainer: {
    // backgroundColor: 'white',
    // margin: 16,
    flex: 1,
  },
  cardTextContainer: {
    alignItems: 'center',
  },
  taskText: {
    ...typography.titleB,
    fontWeight: '400',
    color: 'white',
  },
  hintContainer: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  hintText: {
    ...typography.subheading,
    color: Colors.generalGray,
  },
  textInputBox: {
    padding: 20,
  },
  textInput: {
    ...typography.titleC,
    height: 48,
    minWidth: '80%',
    borderRadius: 8,
  },
})