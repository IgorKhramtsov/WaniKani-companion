import typography from '@/src/constants/typography'
import { useAppDispatch, useAppSelector } from '@/src/hooks/redux'
import {
  fetchSubjects,
  selectStatus,
  selectSubject,
  selectSubjects,
} from '@/src/redux/subjectsSlice'
import { SubjectUtils } from '@/src/types/subject'
import { useLocalSearchParams } from 'expo-router'
import { useEffect, useMemo, useRef } from 'react'
import { ActivityIndicator, Button, Text, View } from 'react-native'
import PagerView from 'react-native-pager-view'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { CompositionPage } from './CompositionPage'
import { MeaningPage } from './MeaningPage'
import { ReadingPage } from './ReadingPage'
import { ContextPage } from './ContextPage'
import { ExamplesPage } from './ExamplesPage'

export default function Index() {
  const dispatch = useAppDispatch()
  const params = useLocalSearchParams<{ subjects: string }>().subjects
  const { styles } = useStyles(stylesheet)

  const subjectIds = useMemo(() => {
    console.log('Processing params: ', params)
    return params?.split(',').map(el => parseInt(el))
  }, [params])
  const subjects = useAppSelector(selectSubjects(subjectIds))
  // const subject = useAppSelector(selectSubject(subjectIds?.[0]))
  const subjectSliceStatus = useAppSelector(selectStatus)
  const parentPagerView = useRef<PagerView>(null)

  useEffect(() => {
    if (subjectIds !== undefined) {
      dispatch(fetchSubjects(subjectIds))
    }
  }, [subjectIds, dispatch])

  if (subjectIds === undefined) {
    return <Text>Couldn't get parameters</Text>
  }

  if (subjectSliceStatus === 'loading' && subjects.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size='large' />
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <PagerView ref={parentPagerView} style={styles.pagerView} initialPage={0}>
        {subjects.map((subject, index) => {
          const primaryMeaning = SubjectUtils.getPrimaryMeaning(subject)
          const subjectColor = SubjectUtils.getAssociatedColor(subject)
          console.log('building subject #', index)
          console.log('\n\nSUBJECT DATA', JSON.stringify(subject, null, 2))
          const getBottomContent = ({
            direction,
          }: {
            direction: 'next' | 'prev'
          }) => (
            <View>
              {((index > 0 && direction === 'prev') ||
                (index < subjects.length && direction === 'next')) && (
                <Button
                  title={direction === 'next' ? 'Next' : 'Prev'}
                  onPress={() =>
                    parentPagerView.current?.setPage(
                      direction === 'next' ? index + 1 : index - 1,
                    )
                  }
                />
              )}

              <View style={{ height: 64 }} />
            </View>
          )

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
                  bottomContent={
                    <View>
                      <Button
                        title='Next'
                        onPress={() =>
                          parentPagerView.current?.setPage(index + 1)
                        }
                      />

                      <View style={{ height: 64 }} />
                    </View>
                  }
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
                  bottomContent={
                    <View>
                      <Button
                        title='Next'
                        onPress={() =>
                          parentPagerView.current?.setPage(index + 1)
                        }
                      />

                      <View style={{ height: 64 }} />
                    </View>
                  }
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
    </View>
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
})
