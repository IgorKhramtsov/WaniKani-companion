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
import { useGetLessonsQuery } from '@/src/api/localDb/assignment'
import { SubjectPickerPage } from '@/src/components/SubjectPickerPage'
import { filterNotUndefined } from '@/src/utils/arrayUtils'

export default function Index() {
  const { styles } = useStyles(stylesheet)
  const { isLoading: assignmentsIsLoading, data: dbAssignments } =
    useGetLessonsQuery()
  const assignments = useMemo(() => dbAssignments ?? [], [dbAssignments])
  const subjectIds = useMemo(() => {
    return assignments.map(el => el.subject_id)
  }, [assignments])
  const { settings } = useSettings()
  const [interleave, setInterleave] = useState(
    settings.interleave_advanced_lessons ?? false,
  )
  const { subjects, isLoading: subjectsIsLoading } = useSubjectCache(subjectIds)

  const isLoading = useMemo(
    () => assignmentsIsLoading || subjectsIsLoading,
    [assignmentsIsLoading, subjectsIsLoading],
  )

  const startLessons = useCallback(
    (subjectIds: number[]) => {
      router.replace({
        pathname: '/lessons',
        params: {
          assignmentIds: (subjectIds.length > 0
            ? assignments.filter(e => subjectIds.includes(e.subject_id))
            : assignments
          ).map(e => e.id),
          interleave: interleave.toString(),
        },
      })
    },
    [assignments, interleave],
  )

  const subjectsByLevel = useMemo(() => {
    const result = new Map<number, Map<SubjectType, Subject[]>>()
    subjects.forEach(subject => {
      if (!result.has(subject.level)) {
        result.set(subject.level, new Map<SubjectType, Subject[]>())
      }
      const levelBucket = result.get(subject.level)!
      const type =
        subject.type === 'kana_vocabulary' ? 'vocabulary' : subject.type
      if (!levelBucket.has(type)) {
        levelBucket!.set(type, [])
      }
      const typeBucket = levelBucket!.get(type)
      typeBucket!.push(subject)
    })

    const typesOrder: SubjectType[] = [
      'radical',
      'kanji',
      'vocabulary',
      'kana_vocabulary',
    ]
    for (const [level, typeMap] of result) {
      const sortedTypeMap = new Map<SubjectType, Subject[]>(
        [...typeMap.entries()].sort(([typeA], [typeB]) => {
          return typesOrder.indexOf(typeA) - typesOrder.indexOf(typeB)
        }),
      )
      for (const [type, subjects] of sortedTypeMap) {
        sortedTypeMap.set(
          type,
          subjects
            .slice()
            .sort(
              (subject1, subject2) =>
                subject1.lesson_position - subject2.lesson_position,
            ),
        )
      }
      result.set(level, sortedTypeMap)
    }
    return result
  }, [subjects])

  const categories = useMemo(() => {
    return filterNotUndefined(
      Array.from(subjectsByLevel.keys()).map(level => {
        const levelBucket = subjectsByLevel.get(level)
        const levelKeys = Array.from(levelBucket?.keys() ?? [])
        if (levelBucket) {
          return {
            name: `Level ${level}`,
            children: filterNotUndefined(
              levelKeys.map(type => {
                const typeBucket = levelBucket.get(type)
                if (!typeBucket) {
                  return undefined
                }

                return {
                  name: StringUtils.capitalizeFirstLetter(type),
                  children: typeBucket,
                }
              }),
            ),
          }
        }
        return undefined
      }),
    )
  }, [subjectsByLevel])

  if (isLoading) {
    return <FullPageLoading />
  }

  return (
    <SubjectPickerPage
      categories={categories}
      bottomBarBuilder={selectedIds => (
        <>
          <Pressable
            style={appStyles.row}
            onPress={() => setInterleave(!interleave)}>
            <FontAwesome
              name={interleave ? 'check-square-o' : 'square-o'}
              size={24}
              color='black'
            />
            <View style={{ width: 8 }} />
            <Text style={typography.callout}>Interleave</Text>
          </Pressable>
          <View style={{ height: 12 }} />

          <Pressable
            style={styles.startButtonView}
            onPress={() => startLessons(selectedIds)}>
            <View style={appStyles.row}>
              <Text style={styles.startButtonText}>
                {selectedIds.length === 0 ? 'Batch, Please!' : 'Start lessons'}
              </Text>
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
        </>
      )}
    />
  )
}

const stylesheet = createStyleSheet({
  startButtonView: {
    backgroundColor: Colors.pink,
    borderRadius: 3,
    width: '80%',
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
    borderBottomColor: Colors.getBottomBorderColor(Colors.pink),
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
