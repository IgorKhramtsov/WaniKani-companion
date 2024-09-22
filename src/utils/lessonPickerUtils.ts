import { shuffle } from 'lodash'
import { Assignment } from '../types/assignment'
import { Subject, SubjectUtils } from '../types/subject'

const bucketAssignmentsBySubjectType = (
  allAssignments: Assignment[],
  subjects: Subject[],
) => {
  const pairedAssignments = allAssignments
    .map(assignment => ({
      lesson: assignment,
      subject: subjects.find(e => e.id === assignment.subject_id),
    }))
    .filter(
      (e): e is { lesson: Assignment; subject: Subject } =>
        e.subject !== undefined,
    )

  const sortedPairs = pairedAssignments
    .sort((a, b) =>
      SubjectUtils.compareByLevelAndLessonPosition(a.subject, b.subject),
    )
    .map(e => e.lesson)

  return sortedPairs.reduce<{
    [key: string]: Assignment[]
  }>((acc, lesson) => {
    const subjectType =
      lesson.subject_type === 'kana_vocabulary'
        ? 'vocabulary'
        : lesson.subject_type
    if (!acc[subjectType]) {
      acc[subjectType] = []
    }
    acc[subjectType].push(lesson)
    return acc
  }, {})
}

export const createLessonsBatch = ({
  batchSize,
  assignments,
  subjects,
  interleave = true,
}: {
  batchSize: number
  assignments: Assignment[]
  subjects: Subject[]
  interleave?: boolean
}) => {
  if (!interleave) {
    return assignments.slice(0, batchSize)
  }

  const bucketedAssignmentsBySubjectType = bucketAssignmentsBySubjectType(
    assignments,
    subjects,
  )
  const totalAssignments = Object.values(
    bucketedAssignmentsBySubjectType,
  ).reduce((sum, assignments) => sum + assignments.length, 0)

  const elementsToTake: { [key: string]: number } = {}
  for (const [subjectType, assignments] of Object.entries(
    bucketedAssignmentsBySubjectType,
  )) {
    const proportion = assignments.length / totalAssignments
    elementsToTake[subjectType] = Math.round(proportion * batchSize)
  }

  // Due to rounding, the sum of elementsToTake may be less than batchSize.
  // In this case, we'll add one to the first type has more elements to take
  if (
    Object.entries(elementsToTake).reduce((sum, e) => sum + e[1], 0) < batchSize
  ) {
    for (const [subjectType, assignments] of Object.entries(
      bucketedAssignmentsBySubjectType,
    )) {
      if (elementsToTake[subjectType] < assignments.length) {
        elementsToTake[subjectType]++
        break
      }
    }
  }

  const batch: Assignment[] = []
  let moreAssignments = true

  while (batch.length < batchSize && moreAssignments) {
    moreAssignments = false
    const typeToGet = shuffle(
      Object.entries(elementsToTake)
        .filter(e => e[1] > 0)
        .map(e => e[0]),
    )[0]
    const count = elementsToTake[typeToGet]
    const bucket = bucketedAssignmentsBySubjectType[typeToGet]

    if (count > 0 && bucket.length > 0) {
      batch.push(bucket.shift()!)
      elementsToTake[typeToGet]--
      moreAssignments = true
    }
  }

  return batch
}
