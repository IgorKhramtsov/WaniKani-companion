import { FullPageLoading } from '@/src/components/FullPageLoading'
import { Colors } from '@/src/constants/Colors'
import { appStyles } from '@/src/constants/styles'
import typography from '@/src/constants/typography'
import { useSubjectCache } from '@/src/hooks/useSubjectCache'
import { Subject, SubjectType } from '@/src/types/subject'
import { StringUtils } from '@/src/utils/stringUtils'
import { FontAwesome } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { useSettings } from '@/src/hooks/useSettings'
import {
  useFindAssignmentsByQuery,
  useGetBurnedAssignmentsQuery,
  useGetRecentLessonsQuery,
} from '@/src/api/localDb/assignment'
import { Category, SubjectPickerPage } from '@/src/components/SubjectPickerPage'
import {
  useGetCriticalConditionReviewStatisticsQuery,
  useGetLevelProgressionsQuery,
  useGetRecentMistakeReviewsQuery,
} from '@/src/api/localDb/api'
import { useFindSubjectsByQuery } from '@/src/api/localDb/subject'

export default function Index() {
  const { styles } = useStyles(stylesheet)
  const { settings } = useSettings()
  const [interleave, setInterleave] = useState(
    settings.interleave_advanced_lessons ?? false,
  )
  const { data: burnedAssignments, isLoading: burnedAssignmentsIsLoading } =
    useGetBurnedAssignmentsQuery()
  const { data: criticalCondition, isLoading: criticalConditionIsLoading } =
    useGetCriticalConditionReviewStatisticsQuery()
  const {
    data: recentMistakeReviews,
    isLoading: recentMistakeReviewsIsLoading,
  } = useGetRecentMistakeReviewsQuery()
  const { data: recentLessons, isLoading: recentLessonsIsLoading } =
    useGetRecentLessonsQuery()
  const { data: levelProgressions, isLoading: levelProgressionsIsLoading } =
    useGetLevelProgressionsQuery()
  const lastThreeLevels = useMemo(
    () =>
      // Copy to allow mutation
      [...(levelProgressions ?? [])]
        .sort((a, b) => b.level - a.level)
        .slice(0, 3)
        .map(lp => lp.level),
    [levelProgressions],
  )
  const { data: subjectsForLevels, isLoading: subjectsForLevelsIsLoading } =
    useFindSubjectsByQuery({ levels: lastThreeLevels })
  const lastThreeLevelSubjectIds = useMemo(
    () => (subjectsForLevels ?? []).map(e => e.id),
    [subjectsForLevels],
  )
  const {
    data: assignmentsForLevelSubjects,
    isLoading: assignmentsForLevelSubjectsIsLoading,
  } = useFindAssignmentsByQuery({ subjectIds: lastThreeLevelSubjectIds })
  const startedAssignments = useMemo(
    () => (assignmentsForLevelSubjects ?? []).filter(e => !!e.started_at),
    [assignmentsForLevelSubjects],
  )
  const startedAssignmentsSubjectIds = useMemo(
    () => startedAssignments.map(e => e.subject_id),
    [startedAssignments],
  )
  const startedSubjectsForLevels = useMemo(
    () =>
      (subjectsForLevels ?? []).filter(e =>
        startedAssignmentsSubjectIds.includes(e.id),
      ),
    [subjectsForLevels, startedAssignmentsSubjectIds],
  )

  const subjectIds = useMemo(
    () =>
      (burnedAssignments ?? [])
        .map(e => e.subject_id)
        .concat((criticalCondition ?? []).map(e => e.subject_id))
        .concat((recentMistakeReviews ?? []).map(e => e.subject_id))
        .concat((recentLessons ?? []).map(e => e.subject_id)),
    [burnedAssignments, criticalCondition, recentMistakeReviews, recentLessons],
  )

  const { subjects } = useSubjectCache(subjectIds, false)
  const subjectsMap = useMemo(
    () =>
      subjects.reduce(
        (map, subject) => {
          map[subject.id] = subject
          return map
        },
        {} as Record<number, Subject>,
      ),
    [subjects],
  )
  // We need a way to be able to select other started subjects. There could be
  // a lot of them, so fetching all and grouping by level is not an option.
  // Options:
  // 1. Add search and group selected from search elements under 'other'
  // 2. Add a way to lazy load subjects for levels. (is there a point to select
  //    subjects by level?)
  //
  // Decision: Load last 3 levels and add search.

  const isLoading = useMemo(
    () =>
      burnedAssignmentsIsLoading ||
      criticalConditionIsLoading ||
      recentMistakeReviewsIsLoading ||
      recentLessonsIsLoading ||
      levelProgressionsIsLoading ||
      subjectsForLevelsIsLoading ||
      assignmentsForLevelSubjectsIsLoading,
    [
      burnedAssignmentsIsLoading,
      criticalConditionIsLoading,
      recentMistakeReviewsIsLoading,
      recentLessonsIsLoading,
      levelProgressionsIsLoading,
      subjectsForLevelsIsLoading,
      assignmentsForLevelSubjectsIsLoading,
    ],
  )

  const categories = useMemo(() => {
    const result: Category[] = []
    if (recentMistakeReviews && recentMistakeReviews.length > 0) {
      result.push({
        name: 'Recent Mistakes',
        children: recentMistakeReviews
          .map(e => subjectsMap[e.subject_id])
          .filter(Boolean),
      })
    }
    if (recentLessons && recentLessons.length > 0) {
      result.push({
        name: 'Recent Lessons',
        children: recentLessons
          .map(e => subjectsMap[e.subject_id])
          .filter(Boolean),
      })
    }
    if (criticalCondition && criticalCondition.length > 0) {
      result.push({
        name: 'Critical Condition',
        children: criticalCondition
          .map(e => subjectsMap[e.subject_id])
          .filter(Boolean),
      })
    }
    if (burnedAssignments && burnedAssignments.length > 0) {
      result.push({
        name: 'Burned Items',
        children: burnedAssignments
          .map(e => subjectsMap[e.subject_id])
          .filter(Boolean),
      })
    }
    const typesOrder: SubjectType[] = [
      'radical',
      'kanji',
      'vocabulary',
      'kana_vocabulary',
    ]
    for (const level of lastThreeLevels) {
      const children = (startedSubjectsForLevels ?? [])
        .filter(e => e.level === level)
        .sort((a, b) => typesOrder.indexOf(a.type) - typesOrder.indexOf(b.type))
      if (children.length > 0) {
        result.push({
          name: `Level ${level}`,
          children: children,
        })
      }
    }
    return result
  }, [
    recentMistakeReviews,
    recentLessons,
    criticalCondition,
    burnedAssignments,
    subjectsMap,
    lastThreeLevels,
    startedSubjectsForLevels,
  ])

  const startLessons = useCallback(
    (subjectIds: number[]) => {
      router.replace({
        pathname: '/lessons',
        params: {
          assignmentIds: subjectIds,
          interleave: interleave.toString(),
        },
      })
    },
    [interleave],
  )

  const startReviews = useCallback((subjectIds: number[]) => {
    router.replace({
      pathname: '/quiz',
      params: {
        subjectIds: subjectIds,
        quizMode: 'quiz',
      },
    })
  }, [])

  if (isLoading) {
    return <FullPageLoading />
  }

  return (
    <SubjectPickerPage
      categories={categories}
      expandable={true}
      bottomBarBuilder={selectedIds => {
        return (
          <>
            {
              // TODO: implement lessons
            }
            <Pressable
              style={[styles.startButtonView, { display: 'none' }]}
              onPress={() => startLessons(selectedIds)}>
              <View style={appStyles.row}>
                <Text style={styles.startButtonText}>Start Lessons</Text>
                {selectedIds.length > 0 && (
                  <>
                    <View style={{ width: 4 }} />
                    <View style={styles.startbuttonLenTextContainer}>
                      <Text style={styles.startbuttonLenText}>
                        {selectedIds.length}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </Pressable>
            <View style={{ height: 12 }} />
            <Pressable
              style={[
                styles.startButtonView,
                {
                  backgroundColor: Colors.blue,
                  borderColor: Colors.getBottomBorderColor(Colors.blue),
                },
              ]}
              onPress={() => startReviews(selectedIds)}>
              <View style={appStyles.row}>
                <Text style={styles.startButtonText}>Start Reviews</Text>
                {selectedIds.length > 0 && (
                  <>
                    <View style={{ width: 4 }} />
                    <View style={styles.startbuttonLenTextContainer}>
                      <Text
                        style={[
                          styles.startbuttonLenText,
                          { color: Colors.blue },
                        ]}>
                        {selectedIds.length}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </Pressable>
          </>
        )
      }}
    />
  )
}

const stylesheet = createStyleSheet({
  startButtonView: {
    backgroundColor: Colors.pink,
    borderRadius: 3,
    flex: 1,
    width: '80%',
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
    borderColor: Colors.getBottomBorderColor(Colors.pink),
  },
  startButtonText: {
    ...typography.callout,
    color: Colors.white,
  },
  startbuttonLenTextContainer: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  startbuttonLenText: {
    ...typography.callout,
    color: Colors.pink,
  },
})
