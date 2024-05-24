import { Colors } from '@/src/constants/Colors'
import typography from '@/src/constants/typography'
import { useAppDispatch, useAppSelector } from '@/src/hooks/redux'
import {
  ReviewTaskUtils,
  answeredCorrectly,
  answeredIncorrectly,
  selectCurrentTask,
  subjectsFetched,
} from '@/src/redux/reviewSlice'
import { fetchSubjects, selectSubjects } from '@/src/redux/subjectsSlice'
import { SubjectUtils } from '@/src/types/subject'
import { StringUtils } from '@/src/utils/stringUtils'
import { useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from 'react-native'
import {
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

type TaskState = 'correct' | 'incorrect' | 'notAnswered'

export default function Index() {
  const dispatch = useAppDispatch()
  const subjects = useLocalSearchParams<{ subjects: string }>()
    .subjects?.split(',')
    .map(el => parseInt(el))
  const { styles } = useStyles(stylesheet)
  const subjectsData = useAppSelector(selectSubjects(subjects))
  const currentTask = useAppSelector(selectCurrentTask)
  const [input, setInput] = useState('')
  const [taskState, setTaskState] = useState<TaskState>('notAnswered')

  useEffect(() => {
    setTaskState('notAnswered')
    setInput('')
  }, [currentTask])

  const submit = useCallback(() => {
    // Second submit will actually submit the task and move to the next (the
    //  same as web app works)
    if (taskState !== 'notAnswered') {
      const args = {
        id: currentTask.subject.id,
        type: currentTask.type,
      }
      if (taskState === 'incorrect') {
        dispatch(answeredIncorrectly(args))
      } else {
        dispatch(answeredCorrectly(args))
      }
      return
    }

    if (input.length === 0) return
    if (ReviewTaskUtils.isReadingTask(currentTask)) {
      // TODO: implement error threshold
      //  reading: wrong type used (oniyomi/kyniyomi)
      //  reading: 1 symbol derivation (or 1 symbol length difference)
      const subject = currentTask.subject
      const matchedReading = subject.readings.find(el => el.reading === input)
      if (matchedReading === undefined) {
        setTaskState('incorrect')
      } else if (!matchedReading.accepted_answer) {
        setTaskState('incorrect')
      } else {
        setTaskState('correct')
      }
    } else {
      const subject = currentTask.subject
      const matchedMeaning = subject.meanings.find(el => el.meaning === input)
      if (matchedMeaning === undefined) {
        setTaskState('incorrect')
      } else if (!matchedMeaning.accepted_answer) {
        setTaskState('incorrect')
      } else {
        setTaskState('correct')
      }
    }
  }, [dispatch, currentTask, input, taskState])

  useEffect(() => {
    if (subjects !== undefined) {
      dispatch(fetchSubjects(subjects))
    }
  }, [subjects, dispatch])

  useEffect(() => {
    dispatch(subjectsFetched(subjectsData))
  }, [subjectsData, dispatch])

  if (subjects === undefined) {
    return <Text>Couldn't get parameters</Text>
  }

  if (currentTask === undefined) {
    return <Text>Current task undefined</Text>
  }

  const subject = currentTask.subject
  const subjectColor = SubjectUtils.getAssociatedColor(subject)
  const subjectName = SubjectUtils.getSubjectName(subject)
  const task = StringUtils.capitalizeFirstLetter(currentTask.type.toString())
  const taskStateColor =
    taskState === 'correct'
      ? Colors.correctGreen
      : taskState === 'incorrect'
        ? Colors.incorrectRed
        : undefined
  const taskStateTextColor = taskState === 'notAnswered' ? undefined : 'white'

  // TODO: rewrite this page to show stack of cards with each card is colored
  // appropriately
  //
  // TODO: The cursor for TextInput is not in the middle when placeholder is in
  // place. To fix that custom placeholder should be implemented

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <TouchableWithoutFeedback
          style={{ height: '100%' }}
          onPress={Keyboard.dismiss}
          accessible={false}>
          <View
            style={[
              styles.glyphDisplayView,
              { backgroundColor: subjectColor },
            ]}>
            <Text style={styles.glyphText}>{subject.characters}</Text>
          </View>
          <View style={styles.taskContainer}>
            <Text style={styles.taskText}>
              {subjectName}{' '}
              <Text style={[styles.taskText, { fontWeight: '500' }]}>
                {task}
              </Text>
            </Text>
          </View>
          <View style={styles.textInputBox}>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: taskStateColor, color: taskStateTextColor },
              ]}
              textAlign={'center'}
              onChangeText={setInput}
              onSubmitEditing={submit}
              value={input}
              blurOnSubmit={false}
              placeholder='Your Response'
            />
          </View>
        </TouchableWithoutFeedback>
      </View>
    </KeyboardAvoidingView>
  )
}

const stylesheet = createStyleSheet({
  scrollView: {
    padding: 20,
  },
  glyphText: {
    ...typography.display1,
    color: 'white',
  },
  glyphName: {
    ...typography.titleB,
    color: 'white',
    fontWeight: '300',
  },
  glyphDisplayView: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskContainer: {
    alignItems: 'center',
  },
  taskText: {
    ...typography.titleB,
    fontWeight: '400',
  },
  textInputBox: {
    flex: 1,
    padding: 20,
    alignContent: 'center',
    justifyContent: 'center',
  },
  textInput: {
    ...typography.titleC,
    textAlign: 'center',
    height: 48,
    borderColor: Colors.generalDarkGray,
    borderBottomWidth: 2,
  },
})
