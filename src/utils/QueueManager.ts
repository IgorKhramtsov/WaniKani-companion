import { QuizTaskHandle } from '../types/quizTask'
import { TaskType } from '../types/quizTaskType'

export const PUSH_DISTANCE = 5
export const TASKS_IN_A_ROW_THRESHOLD = 8

export interface QueueState {
  readingTasks: QuizTaskHandle[]
  meaningTasks: QuizTaskHandle[]
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
  getCurrentTaskHandle(state: QueueState): QuizTaskHandle | undefined {
    return state.currentQueue === 'reading'
      ? state.readingTasks[state.readingIndex]
      : state.meaningTasks[state.meaningIndex]
  },
  getCurrentIndex(state: QueueState): number {
    return state.currentQueue === 'reading'
      ? state.readingIndex
      : state.meaningIndex
  },
  getCurrentQueue(state: QueueState): QuizTaskHandle[] {
    return state.currentQueue === 'reading'
      ? state.readingTasks
      : state.meaningTasks
  },
  peekNextTaskHandle(state: QueueState): QuizTaskHandle | undefined {
    const currentIndex = this.getCurrentIndex(state)
    const currentQueue = this.getCurrentQueue(state)
    const otherIndex =
      state.currentQueue === 'reading' ? state.meaningIndex : state.readingIndex
    const otherQueue =
      state.currentQueue === 'reading' ? state.meaningTasks : state.readingTasks
    if (state.tasksInARow + 1 > TASKS_IN_A_ROW_THRESHOLD) {
      return otherQueue[otherIndex]
    }
    return currentQueue[currentIndex + 1] ?? otherQueue[otherIndex]
  },
  getRemainingReadingTaskHandles(state: QueueState): QuizTaskHandle[] {
    return state.readingTasks.slice(state.readingIndex)
  },
  getRemainingMeaningTaskHandles(state: QueueState): QuizTaskHandle[] {
    return state.meaningTasks.slice(state.meaningIndex)
  },
  move(state: QueueState) {
    if (state.currentQueue === 'reading') {
      state.readingIndex++
    } else {
      state.meaningIndex++
    }

    state.tasksInARow++
    if (this.shouldSwitchQueue(state)) {
      this.switchQueue(state)
    }
  },
  push(state: QueueState) {
    const task = this.getCurrentTaskHandle(state)
    if (task === undefined) {
      console.error('getCurrentTask returned undefined')
      return
    }
    const queue = this.getCurrentQueue(state)
    const index = this.getCurrentIndex(state)

    queue.splice(index, 1)
    const newIndex = Math.min(index + PUSH_DISTANCE, queue.length)
    queue.splice(newIndex, 0, task)

    state.tasksInARow++
    if (this.shouldSwitchQueue(state) || newIndex === index) {
      this.switchQueue(state)
    }
  },
  shouldSwitchQueue(state: QueueState) {
    const hasCompletedReadingQueue =
      state.readingIndex >= state.readingTasks.length
    const hasCompletedMeaningQueue =
      state.meaningIndex >= state.meaningTasks.length
    const otherQueueIsCompleted =
      state.currentQueue === 'reading'
        ? hasCompletedMeaningQueue
        : hasCompletedReadingQueue

    return (
      !otherQueueIsCompleted &&
      (state.tasksInARow > TASKS_IN_A_ROW_THRESHOLD ||
        (state.currentQueue === 'reading' && hasCompletedReadingQueue) ||
        (state.currentQueue === 'meaning' && hasCompletedMeaningQueue))
    )
  },
  switchQueue(state: QueueState) {
    if (
      (state.currentQueue === 'reading' &&
        state.meaningIndex >= state.meaningTasks.length) ||
      (state.currentQueue === 'meaning' &&
        state.readingIndex >= state.readingTasks.length)
    ) {
      // Do not switch if there are no elements in other queue
      return
    }
    state.currentQueue =
      state.currentQueue === 'reading' ? 'meaning' : 'reading'
    state.tasksInARow = 0
  },
}
