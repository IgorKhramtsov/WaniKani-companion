import { selectLessons } from '@/src/api/wanikaniApi'
import { FullPageLoading } from '@/src/components/FullPageLoading'
import { SubjectTile } from '@/src/components/SubjectTile'
import { Colors } from '@/src/constants/Colors'
import { appStyles } from '@/src/constants/styles'
import typography from '@/src/constants/typography'
import { useAppSelector } from '@/src/hooks/redux'
import { useSubjectCache } from '@/src/hooks/useSubjectCache'
import { Subject, SubjectType } from '@/src/types/subject'
import { StringUtils } from '@/src/utils/stringUtils'
import { router } from 'expo-router'
import { Fragment, useCallback, useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeArea } from 'react-native-safe-area-context'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function Index() {
  const { styles } = useStyles(stylesheet)
  const assignments = useAppSelector(selectLessons)
  const subjectIds = useMemo(() => {
    return assignments.map(el => el.subject_id)
  }, [assignments])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const { subjects, isLoading } = useSubjectCache(subjectIds)
  const { bottom: bottomSafePadding } = useSafeArea()

  const toggleSelected = useCallback(
    (id: number) => {
      setSelectedIds(prev =>
        prev.includes(id) ? prev.filter(el => el !== id) : [...prev, id],
      )
    },
    [setSelectedIds],
  )

  const selectedAssignments = useMemo(() => {
    return assignments
      .filter(el => selectedIds.includes(el.subject_id))
      .map(e => e.id)
  }, [assignments, selectedIds])

  const startLessons = useCallback(() => {
    router.replace({
      pathname: '/lessons',
      params: { assignmentIds: selectedAssignments },
    })
  }, [selectedAssignments])

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

  if (isLoading) {
    return <FullPageLoading />
  }

  return (
    <>
      <ScrollView style={styles.pageView}>
        {subjectsByLevel &&
          Array.from(subjectsByLevel.keys()).map(level => {
            const levelBucket = subjectsByLevel.get(level)
            const levelKeys = Array.from(levelBucket?.keys() ?? [])
            return (
              <View key={level} style={styles.levelView}>
                <Text style={styles.viewText}>Level {level}</Text>
                {levelBucket &&
                  levelKeys.map((type, i) => {
                    const subjects = levelBucket.get(type)
                    return (
                      <Fragment key={type}>
                        <View style={styles.typeView}>
                          <Text style={styles.viewText}>
                            {StringUtils.capitalizeFirstLetter(type)}
                          </Text>
                          <View style={styles.subjectsRow}>
                            {subjects &&
                              subjects.map(subject => {
                                const isSelected = selectedIds.includes(
                                  subject.id,
                                )
                                return (
                                  <Pressable
                                        key={subject.id}
                                    onPress={() => toggleSelected(subject.id)}>
                                    <View
                                      style={[
                                        styles.subjectTile,
                                        { opacity: isSelected ? 1.0 : 0.55 },
                                      ]}>
                                      <SubjectTile
                                        subject={subject}
                                        variant='compact'
                                        isPressable={false}
                                      />
                                    </View>
                                  </Pressable>
                                )
                              })}
                          </View>
                        </View>
                        {i < levelKeys.length - 1 && (
                          <View style={{ height: 16 }} />
                        )}
                      </Fragment>
                    )
                  })}
              </View>
            )
          })}
        <View style={{ height: 80 }} />
      </ScrollView>
      <View style={[styles.bottomBar, { bottom: bottomSafePadding }]}>
        <Pressable
          style={styles.startButtonView}
          disabled={selectedIds.length === 0}
          onPress={startLessons}>
          <View style={styles.startButtonView}>
            <Text style={styles.startButtonText}>Start Lessons</Text>
          </View>
        </Pressable>
      </View>
    </>
  )
}

const stylesheet = createStyleSheet({
  pageView: {
    flex: 1,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  startButtonView: {
    backgroundColor: Colors.pink,
    borderRadius: 3,
    width: '80%',
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    ...typography.callout,
    color: Colors.white,
  },
  viewText: {
    ...typography.titleC,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  levelView: {
    padding: 8,
    borderRadius: 8,
  },
  typeView: {
    backgroundColor: Colors.white,
    padding: 8,
    borderRadius: 8,
  },
  subjectsRow: {
    ...appStyles.row,
    flexWrap: 'wrap',
  },
  subjectTile: {
    margin: 4,
  },
})
