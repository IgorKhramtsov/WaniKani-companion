import typography from '@/src/constants/typography'
import { useAppDispatch, useAppSelector } from '@/src/hooks/redux'
import {
  fetchSubjects,
  selectStatus,
  selectSubject,
} from '@/src/redux/subjectsSlice'
import { SubjectUtils } from '@/src/types/subject'
import { useLocalSearchParams } from 'expo-router'
import { useEffect, useMemo } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import PagerView from 'react-native-pager-view'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { CompositionPage } from './CompositionPage'
import { MeaningPage } from './MeaningPage'
import { ReadingPage } from './ReadingPage'
import { ContextPage } from './ContextPage'

export default function Index() {
  const dispatch = useAppDispatch()
  const params = useLocalSearchParams<{ subjects: string }>().subjects
  const { styles } = useStyles(stylesheet)

  const subjectIds = useMemo(() => {
    console.log('Processing params: ', params)
    return params?.split(',').map(el => parseInt(el))
  }, [params])
  const subject = useAppSelector(selectSubject(subjectIds?.[0]))
  const subjectSliceStatus = useAppSelector(selectStatus)

  useEffect(() => {
    if (subjectIds !== undefined) {
      dispatch(fetchSubjects(subjectIds))
    }
  }, [subjectIds, dispatch])

  useEffect(() => {
    if (!subject) return
    if (SubjectUtils.isVocabulary(subject) || SubjectUtils.isKanji(subject)) {
      dispatch(fetchSubjects(subject.component_subject_ids))
    }
  }, [subject, dispatch])

  if (subjectIds === undefined) {
    return <Text>Couldn't get parameters</Text>
  }

  if (subjectSliceStatus === 'loading' && subject === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size='large' />
      </View>
    )
  }

  if (subject === undefined) {
    return <Text>Undefined</Text>
  }
  const primaryMeaning = SubjectUtils.getPrimaryMeaning(subject)
  const subjectColor = SubjectUtils.getAssociatedColor(subject)

  console.log('\n\nSUBJECT DATA', JSON.stringify(subject, null, 2))

  return (
    <View style={{ flex: 1 }}>
      <View
        style={[styles.glyphDisplayView, { backgroundColor: subjectColor }]}>
        <Text style={styles.glyphText}>{subject.characters}</Text>
        <Text style={styles.glyphName}>{primaryMeaning?.meaning}</Text>
      </View>
      <PagerView style={styles.pagerView} initialPage={0}>
        {(SubjectUtils.isVocabulary(subject) ||
          SubjectUtils.isKanji(subject)) && (
          <View key='CompositionPage'>
            <CompositionPage
              subject={subject}
              bottomContent={<View style={{ height: 64 }} />}
            />
          </View>
        )}
        {(SubjectUtils.isVocabulary(subject) ||
          SubjectUtils.isKanji(subject)) && (
          <View key='MeaningPage'>
            <MeaningPage
              subject={subject}
              bottomContent={<View style={{ height: 64 }} />}
            />
          </View>
        )}
        {(SubjectUtils.isVocabulary(subject) ||
          SubjectUtils.isKanji(subject)) && (
          <View key='ReadingPage'>
            <ReadingPage
              subject={subject}
              bottomContent={<View style={{ height: 64 }} />}
            />
          </View>
        )}
        {SubjectUtils.isVocabulary(subject) && (
          <View key='ContextPage'>
            <ContextPage
              subject={subject}
              bottomContent={<View style={{ height: 64 }} />}
            />
          </View>
        )}
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
