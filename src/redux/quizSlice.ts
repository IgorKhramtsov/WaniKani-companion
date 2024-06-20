import {
  PayloadAction,
  SerializedError,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit'
import { Subject, SubjectUtils } from '../types/subject'
import { Vocabulary } from '../types/vocabulary'
import { Kanji } from '../types/kanji'
import { RootState } from './store'
// import { WaniKaniApi } from '../api/wanikani'
import { Assignment } from '../types/assignment'
import { QuizMode } from '../types/quizType'
import { TaskType } from '../types/quizTaskType'
import { EnrichedSubject } from '../utils/answerChecker/types/enrichedSubject'
import _ from 'lodash'

interface BaseQuizTask {
  numberOfErrors: number
  completed: boolean
  reported: boolean
  type: TaskType
  assignmentId?: number
}

interface QuizReadingTask extends BaseQuizTask {
  subject: EnrichedSubject<Vocabulary | Kanji>
  type: 'reading'
}
interface QuizMeaningTask extends BaseQuizTask {
  subject: EnrichedSubject<Subject>
  type: 'meaning'
}

export type QuizTask = QuizReadingTask | QuizMeaningTask

export namespace QuizTaskUtils {
  export function isMeaningTask(task: QuizTask): task is QuizMeaningTask {
    return task.type === 'meaning'
  }

  export function isReadingTask(task: QuizTask): task is QuizReadingTask {
    return task.type === 'reading'
  }
}

const createReadingTask = (
  subject: EnrichedSubject<Vocabulary | Kanji>,
  assignmentId?: number,
): QuizTask => ({
  subject,
  type: 'reading',
  numberOfErrors: 0,
  completed: false,
  reported: false,
  assignmentId,
})

const createMeaningTask = (
  subject: EnrichedSubject<Subject>,
  assignmentId?: number,
): QuizTask => ({
  subject,
  type: 'meaning',
  numberOfErrors: 0,
  completed: false,
  reported: false,
  assignmentId,
})

export interface ReviewSlice {
  tasks: QuizTask[]
  index: number
  mode: QuizMode
  status: 'idle' | 'loading' | 'failed'
  error?: SerializedError
}

const initialState: ReviewSlice = {
  tasks: [],
  index: 0,
  status: 'loading',
  mode: 'quiz',
}

export const quizSlice = createSlice({
  name: 'subjects',
  initialState,
  reducers: {
    reset(state) {
      state.tasks = []
      state.index = 0
      state.status = 'loading'
      console.log('[QuizSlice] RESET')
    },
    init(
      state,
      action: PayloadAction<{
        assignments?: Assignment[]
        enrichedSubjects: EnrichedSubject[]
        mode: QuizMode
      }>,
    ) {
      console.log(
        '[QuizSlice] INIT mode: ',
        action.payload.mode,
        'subjects: ',
        action.payload.enrichedSubjects.length,
        ' assignments: ',
        action.payload?.assignments?.length,
      )
      if (action.payload.enrichedSubjects.length === 0) return

      const readingTasks: QuizTask[] = []
      const meaningTasks: QuizTask[] = []

      const createTasksFor = (
        subject: EnrichedSubject,
        assignment?: Assignment,
      ) => {
        const isReadingTaskRequired = (
          subject: EnrichedSubject,
        ): subject is EnrichedSubject<Vocabulary | Kanji> =>
          SubjectUtils.isVocabulary(subject.subject) ||
          SubjectUtils.isKanji(subject.subject)

        if (isReadingTaskRequired(subject)) {
          readingTasks.push(createReadingTask(subject, assignment?.id))
        }
        meaningTasks.push(createMeaningTask(subject, assignment?.id))
      }

      state.mode = action.payload.mode
      if (action.payload.assignments !== undefined) {
        for (const assignment of action.payload.assignments) {
          const subject = action.payload.enrichedSubjects.find(
            subject => subject.subject.id === assignment.subject_id,
          )
          if (subject === undefined) {
            console.error('Can not find subject for assignment: ', assignment)
            continue
          }
          createTasksFor(subject, assignment)
        }
      } else {
        // If there are no assignments - we might be in a quiz mode. Create
        // tasks just based on subjects.

        for (const subject of action.payload.enrichedSubjects) {
          createTasksFor(subject)
        }
      }

      // TODO: Respect user's setting of review ordering
      state.tasks = getShuffledTasks(
        _.shuffle(readingTasks),
        _.shuffle(meaningTasks),
      )

      state.status = 'idle'
    },
    answeredCorrectly(
      state,
      action: PayloadAction<{ id: number; type: TaskType }>,
    ) {
      const allTasksForSubject = state.tasks.filter(
        task => task.subject.subject.id === action.payload.id,
      )
      const task = allTasksForSubject.find(
        task =>
          task.subject.subject.id === action.payload.id &&
          task.type === action.payload.type,
      )
      if (task === undefined) {
        console.error('Can not find task: ', task)
        return
      }
      task.completed = true
      state.index++
    },
    answeredIncorrectly(
      state,
      action: PayloadAction<{ id: number; type: TaskType }>,
    ) {
      const task = state.tasks.find(
        task =>
          task.subject.subject.id === action.payload.id &&
          task.type === action.payload.type,
      )
      if (task === undefined) {
        console.error(
          'Can not find task for id:',
          action.payload.id,
          'and type:',
          action.payload.type,
        )
        return
      }
      task.numberOfErrors++

      // Remove task and push it to the end of the queue
      const index = state.tasks.indexOf(task)
      if (index > -1) {
        state.tasks.splice(index, 1)
        const minPushDistance = 3
        const maxPushDistance = 9
        const randomNumber =
          minPushDistance +
          Math.floor(Math.random() * (maxPushDistance - minPushDistance))
        const newPos = Math.min(index + randomNumber, state.tasks.length)
        state.tasks.splice(newPos, 0, task)
      }
    },
    markTaskPairAsReported(
      state,
      action: PayloadAction<{ taskPair: QuizTask[] }>,
    ) {
      const tasks = state.tasks.filter(
        task =>
          task.subject.subject.id ===
          action.payload.taskPair[0].subject.subject.id,
      )

      if (tasks === undefined) {
        console.error('Can not find tasks for:', action.payload.taskPair)
        return
      }
      tasks.forEach(task => (task.reported = true))
    },
  },
})

const getShuffledTasks = (
  readingTasks: QuizTask[],
  meaningTasks: QuizTask[],
): QuizTask[] => {
  const resultArray: QuizTask[] = []
  let taskToPush =
    Math.random() <= 0.5 ? readingTasks.pop() : meaningTasks.pop()
  do {
    if (taskToPush !== undefined) {
      resultArray.push(taskToPush)
    }

    const lastTaskType = resultArray[resultArray.length - 1]?.type

    let preferableSupplyArray =
      lastTaskType === 'reading' ? readingTasks : meaningTasks
    let secondarySupplyArray =
      lastTaskType === 'reading' ? meaningTasks : readingTasks

    const preferableTask =
      Math.random() <= 0.7
        ? preferableSupplyArray.pop()
        : secondarySupplyArray.pop()
    taskToPush = preferableTask ?? readingTasks.pop() ?? meaningTasks.pop()
  } while (taskToPush !== undefined)

  return resultArray
}

export const {
  reset,
  init,
  answeredCorrectly,
  answeredIncorrectly,
  markTaskPairAsReported,
} = quizSlice.actions

export const selectStatus = (state: RootState) => state.quizSlice.status
export const selectProgress = createSelector(
  (state: RootState) => state.quizSlice.tasks,
  tasks => {
    const completed = tasks.filter(task => task.completed).length
    const total = tasks.length
    if (total === 0) return 0

    return Math.floor((completed / total) * 100)
  },
)
export const selectCurrentTask = createSelector(
  (state: RootState) => state.quizSlice.index,
  (state: RootState) => state.quizSlice.tasks,
  (index, tasks) => {
    console.log(
      'Selecting current task. index: ',
      index,
      ' tasks: ',
      tasks.length,
    )
    return tasks[index]
  },
)
export const selectNextTask = createSelector(
  (state: RootState) => state.quizSlice.index,
  (state: RootState) => state.quizSlice.tasks,
  (index, tasks): QuizTask | undefined => tasks[index + 1],
)
export const selectTaskPairsForReport = createSelector(
  (state: RootState) => state.quizSlice.tasks,
  (state: RootState) => state.quizSlice.mode,
  (tasks, mode) => {
    // We have nothing to report in quiz mode
    if (mode === 'quiz') return []

    const completedNotReported = tasks.filter(
      task => task.completed && !task.reported,
    )
    const completedNotReportedMeanings = completedNotReported.filter(
      task => task.type === 'meaning',
    )
    const completedNotReportedReadings = completedNotReported.filter(
      task => task.type === 'reading',
    )
    const readyForReportPairs = completedNotReportedMeanings.map(task => {
      if (
        task.subject.subject.type === 'radical' ||
        task.subject.subject.type === 'kana_vocabulary'
      ) {
        return [task]
      }
      const answeredReadingPair = completedNotReportedReadings.find(
        readingTask =>
          readingTask.subject.subject.id === task.subject.subject.id,
      )
      if (answeredReadingPair !== undefined) {
        return [task, answeredReadingPair]
      }

      return undefined
    })
    const definedTaskPairs = readyForReportPairs.filter(
      (taskPair): taskPair is QuizTask[] => taskPair !== undefined,
    )
    return definedTaskPairs
  },
)

export default quizSlice.reducer
