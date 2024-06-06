import { Pressable, ScrollView, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import React, { useCallback, useMemo } from 'react'
import { AntDesign, MaterialIcons } from '@expo/vector-icons'
import { Link, useFocusEffect } from 'expo-router'
import typography from '@/src/constants/typography'
import { useAppDispatch, useAppSelector } from '@/src/hooks/redux'
import Animated, {
  LightSpeedInLeft,
  LightSpeedInRight,
  LightSpeedOutLeft,
  LightSpeedOutRight,
  SequencedTransition,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated'
import { ErrorWithRetry } from '@/src/components/ErrorWithRetry'
import { appStyles } from '@/src/constants/styles'
import { RefreshControl } from 'react-native-gesture-handler'
import {
  fetchLessonsAndReviews,
  selectError,
  selectLessonsBatch,
  selectLessonsCount,
  selectReviewsBatch,
  selectReviewsCount,
  selectStatus,
} from '@/src/redux/assignmentsSlice'
import { Colors } from '@/src/constants/Colors'

export default function Index() {
  const { styles } = useStyles(stylesheet)
  const dispatch = useAppDispatch()
  const status = useAppSelector(selectStatus)
  const lessonsCount = useAppSelector(selectLessonsCount)
  const reviewsCount = useAppSelector(selectReviewsCount)
  const error = useAppSelector(selectError)
  const lessonsBatch = useAppSelector(selectLessonsBatch)
  const lessonIdsBatch = useMemo(
    () => lessonsBatch.map(r => r.id),
    [lessonsBatch],
  )
  const reviewBatch = useAppSelector(selectReviewsBatch)
  const reviewIdsBatch = useMemo(
    () => reviewBatch.map(r => r.id),
    [reviewBatch],
  )

  const refresh = useCallback(
    () => dispatch(fetchLessonsAndReviews()),
    [dispatch],
  )

  useFocusEffect(
    useCallback(() => {
      refresh()
    }, [refresh]),
  )

  const duration = 600
  const enteringAnimationLeft = useMemo(
    () => LightSpeedInLeft.duration(duration),
    [],
  )
  const enteringAnimationRight = useMemo(
    () => LightSpeedInRight.duration(duration),
    [],
  )
  const exitingAnimationLeft = useMemo(
    () => LightSpeedOutLeft.duration(duration),
    [],
  )
  const exitingAnimationRight = useMemo(
    () => LightSpeedOutRight.duration(duration),
    [],
  )

  return (
    <ErrorWithRetry error={error?.message} onRetry={refresh}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={status === 'loading'}
            onRefresh={refresh}
          />
        }>
        <AssignmentsCard
          backgroundColor={Colors.pink}
          layoutAnimationDuration={duration * 0.6}
          loading={status === 'loading'}
          title='Lessons'
          suptitle="Today's"
          assignmentsCount={lessonsCount}
          message='We cooked up these lessons just for you.'
          actions={
            <View>
              <Animated.View
                key={'start'}
                entering={enteringAnimationLeft}
                exiting={exitingAnimationRight}>
                <Link
                  href={{
                    pathname: '/lessons',
                    params: { assignmentIds: lessonIdsBatch },
                  }}
                  asChild>
                  <Pressable style={styles.startButton}>
                    <View style={appStyles.row}>
                      <Text
                        style={[styles.startButtonText, { color: '#FF00AA' }]}>
                        Start Lessons
                      </Text>
                      <View style={{ width: 4 }} />
                      <AntDesign
                        name='right'
                        size={typography.body.fontSize}
                        color='#FF00AA'
                      />
                    </View>
                  </Pressable>
                </Link>
              </Animated.View>
              <View key={'spacer'} style={{ height: 16 }} />
              <Animated.View
                key={'advanced'}
                entering={enteringAnimationRight}
                exiting={exitingAnimationLeft}>
                <Pressable style={styles.advancedButton}>
                  <View style={appStyles.row}>
                    <MaterialIcons
                      name='smart-toy'
                      size={typography.body.fontSize}
                      color='white'
                    />
                    <View style={{ width: 4 }} />
                    <Text style={styles.advancedButtonText}>Advanced</Text>
                  </View>
                </Pressable>
              </Animated.View>
            </View>
          }
        />
        <View style={{ height: 16 }} />
        <AssignmentsCard
          backgroundColor={Colors.blue}
          layoutAnimationDuration={duration * 0.6}
          loading={false}
          title='Reviews'
          assignmentsCount={reviewsCount}
          message='Review these items to level them up!'
          actions={
            <Animated.View
              entering={enteringAnimationLeft}
              exiting={exitingAnimationRight}>
              <Link
                href={{
                  pathname: 'review',
                  params: { assignmentIds: reviewIdsBatch },
                }}
                asChild>
                <Pressable style={styles.startButton}>
                  <View style={appStyles.row}>
                    <Text
                      style={[styles.startButtonText, { color: '#00AAFF' }]}>
                      Start Reviews
                    </Text>
                    <View style={{ width: 4 }} />
                    <AntDesign
                      name='right'
                      size={typography.body.fontSize}
                      color='#00AAFF'
                    />
                  </View>
                </Pressable>
              </Link>
            </Animated.View>
          }
        />
      </ScrollView>
    </ErrorWithRetry>
  )
}

const stylesheet = createStyleSheet({
  scrollView: {
    padding: 20,
    height: '100%',
  },
  text: {
    ...typography.body,
    color: 'white',
  },
  button: {
    color: 'transparent',
    backgroundColor: 'white',
  },
  startButton: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 3,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FF00AA',
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.fontSize * 1.1,
  },
  advancedButton: {
    backgroundColor: 'transparent',
    borderColor: 'white',
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 3,
    alignItems: 'center',
  },
  advancedButtonText: {
    color: 'white',
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.fontSize * 1.1,
  },
})

type AssignmentsCardProps = {
  backgroundColor: string
  title: string
  suptitle?: string
  assignmentsCount: number
  message: string
  actions: React.ReactNode
  loading: boolean
  layoutAnimationDuration: number
  bdageAnimationDuration?: number
}

const AssignmentsCard = ({
  backgroundColor,
  title,
  suptitle,
  assignmentsCount,
  message,
  actions,
  loading,
  layoutAnimationDuration,
  bdageAnimationDuration = 125,
}: AssignmentsCardProps) => {
  const { styles } = useStyles(assignmentsCardStylesheet)
  const enteringAnimation = useMemo(
    () => ZoomIn.duration(bdageAnimationDuration),
    [bdageAnimationDuration],
  )
  const exitingAnimation = useMemo(
    () => ZoomOut.duration(bdageAnimationDuration),
    [bdageAnimationDuration],
  )
  const layoutAnimation = useMemo(
    () => SequencedTransition.duration(layoutAnimationDuration),
    [layoutAnimationDuration],
  )

  return (
    // <LoadingIndicator loading={loading}>
    <Animated.View
      style={[styles.view, { backgroundColor }]}
      layout={layoutAnimation}>
      <View>
        {suptitle && <Text style={styles.text}>{suptitle}</Text>}
        <View style={appStyles.row}>
          <Text style={styles.textHeading}>{title}</Text>
          <View style={{ width: 8 }} />
          {assignmentsCount > 0 && (
            <Animated.View
              style={styles.badge}
              entering={enteringAnimation}
              exiting={exitingAnimation}>
              <Text style={[styles.badgeText, { color: backgroundColor }]}>
                {assignmentsCount}
              </Text>
            </Animated.View>
          )}
        </View>
      </View>
      <View style={{ height: 16 }} />
      <Text style={styles.text}>{message}</Text>
      <View style={{ height: 12 }} />
      {assignmentsCount > 0 && actions}
    </Animated.View>
    // </LoadingIndicator>
  )
}

const assignmentsCardStylesheet = createStyleSheet({
  view: {
    padding: 20,
    borderRadius: 4,
  },
  text: {
    ...typography.body,
    color: 'white',
    lineHeight: typography.body.fontSize * 1.15,
  },
  textHeading: {
    ...typography.titleC,
    color: 'white',
  },
  badge: {
    backgroundColor: 'white',
    borderRadius: 18,
    paddingHorizontal: 7,
    paddingVertical: 3,
    // Adjust so that it's aligned visually at the same line as title
    marginTop: 2.5,
  },
  badgeText: {
    ...typography.label,
    lineHeight: typography.label.fontSize * 1.2,
  },
})
