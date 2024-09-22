import typography from '@/src/constants/typography'
import { SubjectUtils } from '@/src/types/subject'
import { router, useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Button,
  NativeSyntheticEvent,
  Pressable,
  Text,
  View,
} from 'react-native'
import PagerView from 'react-native-pager-view'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { SafeAreaView } from 'react-native-safe-area-context'
import { appStyles } from '@/src/constants/styles'
import { Colors } from '@/src/constants/Colors'
import { AntDesign } from '@expo/vector-icons'
import { FullPageLoading } from '@/src/components/FullPageLoading'
import { useSubjectCache } from '@/src/hooks/useSubjectCache'
import { useAppSelector } from '@/src/hooks/redux'
import { selectAssignments } from '@/src/api/wanikaniApi'
import { SubjectTile } from '@/src/components/SubjectTile'
import { CompositionPage } from '@/src/components/CompositionPage'
import { MeaningPage } from '@/src/components/MeaningPage'
import { ReadingPage } from '@/src/components/ReadingPage'
import { ContextPage } from '@/src/components/ContextPage'
import { ExamplesPage } from '@/src/components/ExamplesPage'
import { useSettings } from '@/src/hooks/useSettings'
import { getPreferedAudio } from '@/src/types/pronunciationAudio'
import { usePronunciationAudio } from '@/src/hooks/usePronunciationAudio'
import { OnPageSelectedEventData } from 'react-native-pager-view/lib/typescript/PagerViewNativeComponent'
import { createLessonsBatch } from '@/src/utils/lessonPickerUtils'

export default function Index() {
  const params = useLocalSearchParams<{
    assignmentIds: string
    interleave?: string
  }>()
  const { styles } = useStyles(stylesheet)
  const parentPagerView = useRef<PagerView>(null)
  const { settings } = useSettings()

  const interleave = useMemo(
    () => (params.interleave ?? 'true').toLowerCase() === 'true',
    [params.interleave],
  )
  const assignmentIds = useMemo(() => {
    return params.assignmentIds?.split(',').map(el => parseInt(el))
  }, [params.assignmentIds])

  const assignments = useAppSelector(selectAssignments(assignmentIds ?? []))

  const subjectIds = useMemo(() => {
    return assignments.map(el => el.subject_id)
  }, [assignments])

  const { subjects, isLoading } = useSubjectCache(subjectIds)

  const lessonsBatch = useMemo(() => {
    const batchSize = settings.lessons_batch_size ?? 5

    if (interleave) {
      return createLessonsBatch({
        batchSize,
        assignments,
        subjects,
        interleave,
      })
    } else {
      return assignments.slice(0, batchSize)
    }
  }, [settings.lessons_batch_size, interleave, assignments, subjects])

  const lessonBatchAssignmentIds = useMemo(
    () => lessonsBatch.map(e => e.id),
    [lessonsBatch],
  )

  const moreLessonIds = useMemo(
    () => assignmentIds.filter(e => !lessonBatchAssignmentIds.includes(e)),
    [assignmentIds, lessonBatchAssignmentIds],
  )

  const lessonBatchSubjects = useMemo(() => {
    const selectedSubjects = subjects.filter(e =>
      lessonsBatch.map(e => e.subject_id).includes(e.id),
    )

    // Preserve order of lessonsBatch
    selectedSubjects.sort((a, b) => {
      const aIndex = lessonsBatch.findIndex(e => e.subject_id === a.id)
      const bIndex = lessonsBatch.findIndex(e => e.subject_id === b.id)
      return aIndex - bIndex
    })
    return selectedSubjects
  }, [lessonsBatch, subjects])

  const [parentPagerIndex, setParentPagerIndex] = useState(0)
  const [subjectPagerIndex, setSubjectPagerIndex] = useState(0)
  const selectedSubject = useMemo(
    () => lessonBatchSubjects[parentPagerIndex],
    [lessonBatchSubjects, parentPagerIndex],
  )
  const pronunciationAudio = useMemo(
    () =>
      SubjectUtils.isVocabulary(selectedSubject)
        ? getPreferedAudio(
            selectedSubject.pronunciation_audios,
            settings.default_voice,
          )
        : undefined,
    [selectedSubject, settings.default_voice],
  )
  const { playSound, isLoading: soundIsLoading } =
    usePronunciationAudio(pronunciationAudio)

  const selectParentPage = useCallback(
    (event: NativeSyntheticEvent<OnPageSelectedEventData>) => {
      setParentPagerIndex(event.nativeEvent.position)
    },
    [setParentPagerIndex],
  )
  const selectSubjectPage = useCallback(
    (event: NativeSyntheticEvent<OnPageSelectedEventData>) => {
      setSubjectPagerIndex(event.nativeEvent.position)
    },
    [setSubjectPagerIndex],
  )

  useEffect(() => {
    const subject = lessonBatchSubjects[subjectPagerIndex]
    if (SubjectUtils.isVocabulary(subject)) {
      if (
        settings.lessons_autoplay_audio &&
        subjectPagerIndex === 2 &&
        !soundIsLoading
      ) {
        playSound().catch(console.error)
      }
    }
  }, [
    soundIsLoading,
    playSound,
    settings.lessons_autoplay_audio,
    lessonBatchSubjects,
    parentPagerIndex,
    subjectPagerIndex,
  ])

  const openQuiz = useCallback(() => {
    router.push({
      pathname: '/quiz',
      params: {
        assignmentIds: lessonBatchAssignmentIds,
        moreLessonIds,
      },
    })
  }, [lessonBatchAssignmentIds, moreLessonIds])

  if (subjectIds === undefined) {
    return <Text>Couldn't get parameters</Text>
  }

  if (isLoading) {
    return <FullPageLoading />
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <PagerView
        ref={parentPagerView}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={selectParentPage}>
        {lessonBatchSubjects.map((subject, index) => {
          const primaryMeaning = SubjectUtils.getPrimaryMeaning(subject)
          const subjectColor = SubjectUtils.getAssociatedColor(subject)
          const isLast = index === lessonBatchSubjects.length - 1
          const getBottomContent = ({
            direction,
          }: {
            direction: 'next' | 'prev'
          }) => {
            const buttonTitle =
              direction === 'next' ? (isLast ? 'Start Quiz' : 'Next') : 'Prev'
            const onPress = () => {
              if (direction === 'next' && isLast) {
                openQuiz()
              } else {
                // TODO: set innerPagerView page to 0
                parentPagerView.current?.setPage(
                  direction === 'next' ? index + 1 : index - 1,
                )
              }
            }
            return (
              <View>
                {((index > 0 && direction === 'prev') ||
                  (index < lessonBatchSubjects.length &&
                    direction === 'next')) && (
                  <Button title={buttonTitle} onPress={onPress} />
                )}

                <View style={{ height: 64 }} />
              </View>
            )
          }

          const pages = []
          if (
            SubjectUtils.isKanji(subject) ||
            SubjectUtils.isVocabulary(subject)
          ) {
            pages.push(
              <View key='CompositionPage'>
                <CompositionPage
                  subject={subject}
                  bottomContent={getBottomContent({ direction: 'prev' })}
                />
              </View>,
            )
          }
          pages.push(
            <View key='MeaningPage' collapsable={false}>
              <MeaningPage
                subject={subject}
                bottomContent={
                  SubjectUtils.isRadical(subject) ||
                  SubjectUtils.isKanaVocabulary(subject) ? (
                    getBottomContent({ direction: 'prev' })
                  ) : (
                    <View style={{ height: 64 }} />
                  )
                }
              />
            </View>,
          )
          if (
            SubjectUtils.isKanji(subject) ||
            SubjectUtils.isVocabulary(subject)
          ) {
            pages.push(
              <View key='ReadingPage' collapsable={false}>
                <ReadingPage
                  subject={subject}
                  bottomContent={<View style={{ height: 64 }} />}
                />
              </View>,
            )
          }
          if (
            SubjectUtils.isKanaVocabulary(subject) ||
            SubjectUtils.isVocabulary(subject)
          ) {
            pages.push(
              <View key='ContextPage' collapsable={false}>
                <ContextPage
                  subject={subject}
                  bottomContent={getBottomContent({ direction: 'next' })}
                />
              </View>,
            )
          }
          if (
            SubjectUtils.isKanji(subject) ||
            SubjectUtils.isRadical(subject)
          ) {
            pages.push(
              <View key='ExamplesPage' collapsable={false}>
                <ExamplesPage
                  subject={subject}
                  bottomContent={getBottomContent({ direction: 'next' })}
                />
              </View>,
            )
          }

          // return <Text>{index}</Text>
          return (
            <View style={{ flex: 1 }} key={index} collapsable={false}>
              <View
                style={[
                  styles.glyphDisplayView,
                  { backgroundColor: subjectColor },
                ]}>
                <Text style={styles.glyphText}>{subject.characters}</Text>
                <Text style={styles.glyphName}>{primaryMeaning?.meaning}</Text>
              </View>
              <PagerView
                style={styles.pagerView}
                initialPage={0}
                onPageSelected={selectSubjectPage}>
                {pages}
              </PagerView>
            </View>
          )
        })}
      </PagerView>
      <View style={styles.subjectQueueContainer}>
        {lessonBatchSubjects.map((subject, index) => (
          // TODO: probably should be moved to bottomContent of the pages
          <Pressable
            key={subject.id}
            onPress={() => parentPagerView.current?.setPage(index)}>
            <View style={styles.subjectQueueItem}>
              <SubjectTile
                isPressable={false}
                id={subject.id}
                variant={'compact'}
              />
            </View>
          </Pressable>
        ))}
        <Pressable key={'quiz'} onPress={openQuiz}>
          <View style={[styles.subjectQueueItem, styles.quizItem]}>
            <Text style={styles.quizItemText}>Quiz</Text>
            <View style={{ width: 4 }} />
            <AntDesign name='arrowright' size={24} color='white' />
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const stylesheet = createStyleSheet({
  scrollView: {
    padding: 20,
  },
  text: {
    ...typography.body,
    color: 'white',
  },
  glyphText: {
    ...typography.display1,
    color: 'white',
  },
  glyphName: {
    ...typography.titleB,
    color: 'white',
    fontWeight: '300',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  glyphDisplayView: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pagerView: {
    flex: 1,
  },
  subjectQueueContainer: {
    ...appStyles.row,
    justifyContent: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
  },
  subjectQueueItem: {
    padding: 3,
  },
  quizItem: {
    ...appStyles.row,
    backgroundColor: Colors.quizGreen,
    padding: 4,
    paddingHorizontal: 10,
    borderBottomWidth: 2,
    borderBottomColor: Colors.getBottomBorderColor(Colors.quizGreen),
  },
  quizItemText: {
    ...typography.titleC,
    color: 'white',
  },
})
