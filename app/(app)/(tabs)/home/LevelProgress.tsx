import {
  useFindAssignmentsByQuery,
  useFindSubjectsByQuery,
  useGetLevelProgressionsQuery,
} from '@/src/api/localDbApi'
import { Colors } from '@/src/constants/Colors'
import typography from '@/src/constants/typography'
import { useMemo } from 'react'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export const LevelProgress = () => {
  const { styles } = useStyles(stylesheet)
  const { data: levelProgressions, isLoading } = useGetLevelProgressionsQuery()
  const currentLevel = useMemo(
    () =>
      levelProgressions
        ?.filter(e => !!e.unlocked_at)
        .reduce((acc, e) => Math.max(e.level, acc), 0),
    [levelProgressions],
  )
  const { data: kanjiOnLevel } = useFindSubjectsByQuery({
    level: currentLevel,
    type: 'kanji',
  })
  const subjectIds = useMemo(
    () => kanjiOnLevel?.map(e => e.id) ?? [],
    [kanjiOnLevel],
  )
  const { data: assignmentsOnLevel } = useFindAssignmentsByQuery(
    { subjectIds },
    { skip: subjectIds.length === 0 },
  )
  const totalKanjiCount = useMemo(
    // next level is available on passing 90%
    () => Math.ceil((kanjiOnLevel?.length ?? 0) * 0.9),
    [kanjiOnLevel],
  )
  const passedCount = useMemo(
    () => assignmentsOnLevel?.filter(e => e.srs_stage > 5)?.length ?? 0,
    [assignmentsOnLevel],
  )
  const progress = useMemo(
    () => (passedCount / totalKanjiCount) * 100,
    [passedCount, totalKanjiCount],
  )

  if (isLoading) {
    return <></>
  }

  return (
    <View style={styles.container}>
      <Text style={typography.titleC}>Level {currentLevel} Progress</Text>
      <View style={{ height: 8 }} />
      <View style={styles.progressBarOuter}>
        <View style={[styles.progressBarInner, { width: `${progress}%` }]} />
        <View style={[styles.progressBarDot, { left: `${progress - 1}%` }]} />
      </View>
      <View style={{ height: 4 }} />
      <Text style={typography.caption}>
        {passedCount} of {totalKanjiCount} kanji passed
      </Text>
    </View>
  )
}

const stylesheet = createStyleSheet({
  container: {
    marginHorizontal: 20,
  },
  progressBarOuter: {
    backgroundColor: Colors.statisticsGreen,
    height: 10,
    borderRadius: 5,
    width: '100%',
  },
  progressBarInner: {
    backgroundColor: Colors.statisticsGreenLine,
    height: 10,
    borderRadius: 5,
    width: '100%',
  },
  progressBarDot: {
    position: 'absolute',
    backgroundColor: Colors.statisticsGreenLine,
    height: 18,
    width: 18,
    top: -4,
    borderRadius: 40,
    borderColor: 'white',
    borderWidth: 2,
  },
})
