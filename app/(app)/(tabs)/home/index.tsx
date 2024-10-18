import { ColorValue, Pressable, ScrollView, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import React, { useCallback, useMemo } from 'react'
import { AntDesign, MaterialIcons } from '@expo/vector-icons'
import { Href, Link } from 'expo-router'
import typography from '@/src/constants/typography'
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
import { Colors } from '@/src/constants/Colors'
import { useSettings } from '@/src/hooks/useSettings'
import { useSubjectCache } from '@/src/hooks/useSubjectCache'
import { Forecast } from './forecast'
import { useDbHydrator } from '@/src/hooks/useDbHydrator'
import { createLessonsBatch } from '@/src/utils/lessonPickerUtils'
import { LevelProgress } from './LevelProgress'
import {
  useGetLessonsCompletedTodayQuery,
  useGetLessonsQuery,
  useGetReviewsQuery,
} from '@/src/api/localDb/assignment'

export default function Index() {
  const { styles } = useStyles(stylesheet)
  const { settings, isLoading: settingsIsLoading } = useSettings()
  const { isLoading: lessonsIsLoading, data: dbLessons } = useGetLessonsQuery()
  const lessons = useMemo(() => dbLessons ?? [], [dbLessons])
  const { isLoading: reviewsIsLoading, data: dbReviews } = useGetReviewsQuery()
  const reviews = useMemo(() => dbReviews ?? [], [dbReviews])
  const {
    data: dbLessonsCompletedToday,
    isLoading: lessonsCompletedTodayIsLoading,
  } = useGetLessonsCompletedTodayQuery()
  const lessonsCompletedToday = useMemo(
    () => dbLessonsCompletedToday ?? [],
    [dbLessonsCompletedToday],
  )
  const lessonsCount = useMemo(() => lessons.length, [lessons])
  const reviewsCount = useMemo(() => reviews.length, [reviews])
  const { isLoading: dbHydratorIsLoading, triggerUpdate: triggerDbUpdate } =
    useDbHydrator(true)

  const isLoading = useMemo(
    () =>
      dbHydratorIsLoading ||
      lessonsIsLoading ||
      reviewsIsLoading ||
      settingsIsLoading ||
      lessonsCompletedTodayIsLoading,
    [
      dbHydratorIsLoading,
      lessonsIsLoading,
      reviewsIsLoading,
      settingsIsLoading,
      lessonsCompletedTodayIsLoading,
    ],
  )
  const availableLessonsCount = useMemo(
    () =>
      Math.min(lessonsCount, settings.max_lessons_per_day ?? 15) -
      lessonsCompletedToday.length,
    [lessonsCount, settings.max_lessons_per_day, lessonsCompletedToday],
  )

  const lessonSubjects = useMemo(
    () => lessons.map(l => l.subject_id),
    [lessons],
  )

  const { subjects } = useSubjectCache(lessonSubjects, false)

  const dailyLessons = useMemo(() => {
    const batchSize = availableLessonsCount

    return createLessonsBatch({ batchSize, assignments: lessons, subjects })
  }, [availableLessonsCount, lessons, subjects])
  const lessonIdsBatch = useMemo(
    () => dailyLessons.map(r => r.id),
    [dailyLessons],
  )
  const reviewIdsBatch = useMemo(() => reviews.map(r => r.id), [reviews])

  const refresh = useCallback(() => {
    triggerDbUpdate()
  }, [triggerDbUpdate])

  const duration = 600

  return (
    <ErrorWithRetry error={undefined} onRetry={refresh}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refresh} />
        }>
        <LevelProgress />
        <View style={{ height: 8 }} />
        <AssignmentsCard
          backgroundColor={Colors.pink}
          layoutAnimationDuration={duration * 0.6}
          loading={isLoading}
          title='Lessons'
          suptitle="Today's"
          assignmentsCount={availableLessonsCount}
          message='We cooked up these lessons just for you.'
          actions={
            <View>
              <CardButton
                animationDirection='left'
                animationDuration={duration}
                textColor={Colors.pink}
                label='Start Lessons'
                labelPostfix={
                  <AntDesign
                    name='right'
                    size={typography.body.fontSize}
                    color={Colors.pink}
                  />
                }
                href={{
                  pathname: '/lessons',
                  params: { assignmentIds: lessonIdsBatch },
                }}
              />
              <View key={'spacer'} style={{ height: 16 }} />
              <CardButton
                animationDirection='right'
                animationDuration={duration}
                textColor={Colors.white}
                style='outlined'
                label='Advanced'
                labelPrefix={
                  <MaterialIcons
                    name='smart-toy'
                    size={typography.body.fontSize}
                    color='white'
                  />
                }
                href={{
                  pathname: '/lessonPicker',
                  params: { assignmentIds: lessonIdsBatch },
                }}
              />
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
            <CardButton
              animationDirection='left'
              animationDuration={duration}
              textColor={Colors.blue}
              href={{
                pathname: '/review',
                params: { assignmentIds: reviewIdsBatch },
              }}
              label='Start Reviews'
              labelPostfix={
                <AntDesign
                  name='right'
                  size={typography.body.fontSize}
                  color={Colors.blue}
                />
              }
            />
          }
        />
        <View style={{ height: 16 }} />
        <Forecast />
        <View style={{ height: 64 }} />
      </ScrollView>
    </ErrorWithRetry>
  )
}

const stylesheet = createStyleSheet({
  scrollView: {
    paddingVertical: 20,
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
  bdageAnimationDuration = 125,
  assignmentsCount,
  ...props
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

  return (
    <Card
      {...props}
      actions={assignmentsCount > 0 ? props.actions : null}
      badge={
        assignmentsCount > 0 ? (
          <Animated.View
            style={styles.badge}
            entering={enteringAnimation}
            exiting={exitingAnimation}>
            <Text style={[styles.badgeText, { color: props.backgroundColor }]}>
              {assignmentsCount}
            </Text>
          </Animated.View>
        ) : null
      }
    />
  )
}

const assignmentsCardStylesheet = createStyleSheet({
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

type CardProps = {
  backgroundColor: string
  textColor?: ColorValue
  title: string
  suptitle?: string
  message: string
  actions: React.ReactNode
  layoutAnimationDuration: number
  badge?: React.ReactNode
}

const Card = ({
  backgroundColor,
  textColor = 'white',
  title,
  suptitle,
  message,
  actions,
  layoutAnimationDuration,
  badge,
}: CardProps) => {
  const { styles } = useStyles(cardStylesheet)
  const layoutAnimation = useMemo(
    () => SequencedTransition.duration(layoutAnimationDuration),
    [layoutAnimationDuration],
  )

  return (
    <Animated.View
      style={[styles.view, { backgroundColor }]}
      layout={layoutAnimation}>
      <View>
        {suptitle && (
          <Text style={[styles.text, { color: textColor }]}>{suptitle}</Text>
        )}
        <View style={appStyles.row}>
          <Text style={[styles.textHeading, { color: textColor }]}>
            {title}
          </Text>
          {badge && (
            <>
              <View style={{ width: 8 }} />
              {badge}
            </>
          )}
        </View>
      </View>
      <View style={{ height: 16 }} />
      <Text style={[styles.text, { color: textColor }]}>{message}</Text>
      <View style={{ height: 12 }} />
      {actions}
    </Animated.View>
  )
}

const cardStylesheet = createStyleSheet({
  view: {
    marginHorizontal: 20,
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
})

type CardButtonProps = {
  animationDirection: 'left' | 'right'
  animationDuration: number
  textColor: ColorValue
  href: Href<string | object>
  label: string
  labelPrefix?: React.ReactNode
  labelPostfix?: React.ReactNode
  style?: 'filled' | 'outlined'
}

const CardButton = ({
  animationDirection,
  animationDuration,
  textColor,
  href,
  label,
  labelPrefix,
  labelPostfix,
  style = 'filled',
}: CardButtonProps) => {
  const { styles } = useStyles(cardButtonStylesheet)

  const enteringAnimationLeft = useMemo(
    () => LightSpeedInLeft.duration(animationDuration),
    [animationDuration],
  )
  const enteringAnimationRight = useMemo(
    () => LightSpeedInRight.duration(animationDuration),
    [animationDuration],
  )
  const exitingAnimationLeft = useMemo(
    () => LightSpeedOutLeft.duration(animationDuration),
    [animationDuration],
  )
  const exitingAnimationRight = useMemo(
    () => LightSpeedOutRight.duration(animationDuration),
    [animationDuration],
  )
  const animations = useMemo(
    () =>
      animationDirection === 'left'
        ? { entering: enteringAnimationLeft, exiting: exitingAnimationRight }
        : { entering: enteringAnimationRight, exiting: exitingAnimationLeft },
    [
      animationDirection,
      enteringAnimationLeft,
      enteringAnimationRight,
      exitingAnimationLeft,
      exitingAnimationRight,
    ],
  )

  return (
    <Animated.View entering={animations.entering} exiting={animations.exiting}>
      <Link href={href} asChild>
        <Pressable
          style={
            style === 'filled' ? styles.filledButton : styles.outlinedButton
          }>
          <View style={appStyles.row}>
            {labelPrefix && (
              <>
                {labelPrefix}
                <View style={{ width: 4 }} />
              </>
            )}
            <Text style={[styles.buttonText, { color: textColor }]}>
              {label}
            </Text>
            {labelPostfix && (
              <>
                <View style={{ width: 4 }} />
                {labelPostfix}
              </>
            )}
          </View>
        </Pressable>
      </Link>
    </Animated.View>
  )
}

const cardButtonStylesheet = createStyleSheet({
  button: {
    color: 'transparent',
    backgroundColor: 'white',
  },
  filledButton: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 3,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.fontSize * 1.1,
  },
  outlinedButton: {
    backgroundColor: 'transparent',
    borderColor: 'white',
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 3,
    alignItems: 'center',
  },
})
