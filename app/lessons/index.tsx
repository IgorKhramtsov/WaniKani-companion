import typography from '@/src/constants/typography'
import { SubjectUtils } from '@/src/types/subject'
import { router, useLocalSearchParams } from 'expo-router'
import { useCallback, useMemo, useRef } from 'react'
import { Button, Pressable, Text, View } from 'react-native'
import PagerView from 'react-native-pager-view'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { CompositionPage } from './CompositionPage'
import { MeaningPage } from './MeaningPage'
import { ReadingPage } from './ReadingPage'
import { ContextPage } from './ContextPage'
import { ExamplesPage } from './ExamplesPage'
import { GlyphTile } from './GlyphTile'
import { SafeAreaView } from 'react-native-safe-area-context'
import { appStyles } from '@/src/constants/styles'
import { Colors } from '@/src/constants/Colors'
import { AntDesign } from '@expo/vector-icons'
import { FullPageLoading } from '@/src/components/FullPageLoading'
import { useSubjectCache } from '@/src/hooks/useSubjectCache'

export default function Index() {
  const params = useLocalSearchParams<{ subjects: string }>().subjects
  const { styles } = useStyles(stylesheet)

  const subjectIds = useMemo(() => {
    console.log('[lessons] Processing params: ', params)
    return params?.split(',').map(el => parseInt(el))
  }, [params])
  const { subjects, subjectSliceStatus } = useSubjectCache(subjectIds)
  const parentPagerView = useRef<PagerView>(null)

  const openQuiz = useCallback(() => {
    router.replace({ pathname: 'quiz', params: { subjects: subjectIds } })
  }, [subjectIds])

  if (subjectIds === undefined) {
    return <Text>Couldn't get parameters</Text>
  }

  if (subjectSliceStatus === 'loading') {
    return <FullPageLoading />
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <PagerView ref={parentPagerView} style={styles.pagerView} initialPage={0}>
        {subjects.map((subject, index) => {
          const primaryMeaning = SubjectUtils.getPrimaryMeaning(subject)
          const subjectColor = SubjectUtils.getAssociatedColor(subject)
          const isLast = index === subjects.length - 1
          console.log('[lessons] building subject #', index)
          // console.log('\n\nSUBJECT DATA', JSON.stringify(subject, null, 2))
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
                  (index < subjects.length && direction === 'next')) && (
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
              <PagerView style={styles.pagerView} initialPage={0}>
                {pages}
              </PagerView>
            </View>
          )
        })}
      </PagerView>
      <View style={styles.subjectQueueContainer}>
        {subjects.map((subject, index) => (
          // TODO: probably we should move that to bottomContent of the pages
          <Pressable
            key={subject.id}
            onPress={() => parentPagerView.current?.setPage(index)}>
            <View style={styles.subjectQueueItem}>
              <GlyphTile id={subject.id} variant={'compact'} />
            </View>
          </Pressable>
        ))}
        <Pressable key={'quiz'}>
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
