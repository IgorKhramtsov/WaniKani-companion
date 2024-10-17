import { useGetLevelProgressionsQuery } from '@/src/api/localDb/api'
import { useFindAssignmentsByQuery } from '@/src/api/localDb/assignment'
import { useFindSubjectsByQuery } from '@/src/api/localDb/subject'
import { Colors } from '@/src/constants/Colors'
import typography from '@/src/constants/typography'
import { useCallback, useMemo, useState } from 'react'
import { LayoutChangeEvent, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

const PROGRESS_BAR_HEIGHT = 34
const SHADOW_OFFSET = 2

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
    () => (totalKanjiCount > 0 ? (passedCount / totalKanjiCount) * 100 : 0),
    [passedCount, totalKanjiCount],
  )
  const [fullWidth, setFullWidth] = useState(0)
  const onLayout = useCallback(
    (e: LayoutChangeEvent) => setFullWidth(e.nativeEvent.layout.width),
    [setFullWidth],
  )
  const progressOffset = useMemo(
    () =>
      PROGRESS_BAR_HEIGHT +
      (progress / 100) * (fullWidth - PROGRESS_BAR_HEIGHT),
    [progress, fullWidth],
  )

  const kanjiOffset = useMemo(
    () => (progressOffset > fullWidth / 2 ? 0 : progressOffset),
    [progressOffset, fullWidth],
  )

  if (isLoading) {
    return <></>
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Level {currentLevel} Progress</Text>
      <View style={{ height: 6 }} />
      <View style={styles.progressBarOuter} onLayout={onLayout}>
        <View
          style={[
            styles.progressBarInner,
            { width: progressOffset - SHADOW_OFFSET },
          ]}
        />
        <View
          style={[
            styles.kanjiPassedContainer,
            {
              marginLeft: kanjiOffset,
              width:
                // removing (bar / 2) make the width start at the center of DOT
                kanjiOffset > 0
                  ? fullWidth - progressOffset - PROGRESS_BAR_HEIGHT / 2
                  : progressOffset - PROGRESS_BAR_HEIGHT / 2,
            },
          ]}>
          <Text
            style={[
              styles.kanjiPassedText,
              kanjiOffset > 0 ? {} : { color: Colors.pink },
            ]}>
            {passedCount} of {totalKanjiCount} kanji passed
          </Text>
        </View>
        <View
          style={[
            styles.progressBarDot,
            { left: progressOffset - PROGRESS_BAR_HEIGHT - SHADOW_OFFSET },
          ]}>
          <Text>🚀</Text>
        </View>
      </View>
      <View style={{ height: 4 }} />
    </View>
  )
}

const stylesheet = createStyleSheet({
  container: {
    marginHorizontal: 20,
    backgroundColor: Colors.pink,
    borderRadius: 3,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  titleText: {
    ...typography.heading,
    fontWeight: '400',
    color: Colors.white,
  },
  kanjiPassedContainer: {
    position: 'absolute',
    width: 'auto',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  kanjiPassedText: {
    ...typography.caption,
    fontWeight: '500',
    color: Colors.white,
  },
  progressBarOuter: {
    backgroundColor: Colors.pinkDark,
    height: PROGRESS_BAR_HEIGHT,
    borderRadius: 40,
    width: '100%',
    borderColor: Colors.getDarker(Colors.pinkDark, 10),
    borderTopWidth: SHADOW_OFFSET,
    borderRightWidth: SHADOW_OFFSET,
    borderLeftWidth: SHADOW_OFFSET,
  },
  progressBarInner: {
    backgroundColor: Colors.white,
    top: -2,
    left: -2,
    height: PROGRESS_BAR_HEIGHT,
    borderRadius: 40,
    borderColor: Colors.getDarker(Colors.white, 35),
    borderLeftWidth: SHADOW_OFFSET,
    borderTopWidth: SHADOW_OFFSET,
  },
  progressBarDot: {
    top: -SHADOW_OFFSET,
    position: 'absolute',
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    height: PROGRESS_BAR_HEIGHT,
    width: PROGRESS_BAR_HEIGHT,
    borderRadius: 40,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 1,
  },
})
