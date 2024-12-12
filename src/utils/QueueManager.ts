import { QuizTask } from '../types/quizTask'
import { TaskType } from '../types/quizTaskType'

export const PUSH_DISTANCE = 5
export const TASKS_IN_A_ROW_THRESHOLD = 8

export interface QueueState {
  readingTasks: QuizTask[]
  meaningTasks: QuizTask[]
  currentQueue: TaskType
  readingIndex: number
  meaningIndex: number
  tasksInARow: number
}

export const initialQueueState = Object.freeze({
  readingTasks: [],
  meaningTasks: [],
  currentQueue: 'reading',
  readingIndex: 0,
  meaningIndex: 0,
  tasksInARow: 0,
})

export const QueueManagerHelpers = {
  getCurrentTask(state: QueueState): QuizTask | undefined {
    return state.currentQueue === 'reading'
      ? state.readingTasks[state.readingIndex]
      : state.meaningTasks[state.meaningIndex]
  },
  peekNextTask(state: QueueState): QuizTask | undefined {
    return state.currentQueue === 'reading'
      ? state.readingTasks[state.readingIndex + 1]
      : state.meaningTasks[state.meaningIndex + 1]
  },
  getRemainingReadingTasks(state: QueueState): QuizTask[] {
    return state.readingTasks.slice(state.readingIndex)
  },
  getRemainingMeaningTasks(state: QueueState): QuizTask[] {
    return state.meaningTasks.slice(state.meaningIndex)
  },
  move(state: QueueState) {
    if (state.currentQueue === 'reading') {
      state.readingIndex++
    } else {
      state.meaningIndex++
    }

    state.tasksInARow++
    this.switchQueueIfNeeded(state)
  },
  push(state: QueueState) {
    const task = this.getCurrentTask(state)
    if (task === undefined) {
      console.error('getCurrentTask returned undefined')
      return
    }
    const queue =
      state.currentQueue === 'reading' ? state.readingTasks : state.meaningTasks
    const index =
      state.currentQueue === 'reading' ? state.readingIndex : state.meaningIndex

    queue.splice(index, 1)
    const newIndex = Math.min(index + PUSH_DISTANCE, queue.length)
    queue.splice(newIndex, 0, task)

    state.tasksInARow++
    this.switchQueueIfNeeded(state)
  },
  switchQueueIfNeeded(state: QueueState) {
    const hasCompletedReadingTask =
      state.readingIndex >= state.readingTasks.length
    const hasCompletedMeaningTask =
      state.meaningIndex >= state.meaningTasks.length

    if (
      state.tasksInARow > TASKS_IN_A_ROW_THRESHOLD ||
      hasCompletedReadingTask ||
      hasCompletedMeaningTask
    ) {
      state.currentQueue =
        state.currentQueue === 'reading' ? 'meaning' : 'reading'
      state.tasksInARow = 0
    }
  },
}
