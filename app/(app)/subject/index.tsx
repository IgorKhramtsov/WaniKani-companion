import { CompositionSection } from '@/src/components/CompositionPage'
import { ContextSection } from '@/src/components/ContextPage'
import { ExamplesSection } from '@/src/components/ExamplesPage'
import { FullPageLoading } from '@/src/components/FullPageLoading'
import { MeaningSection } from '@/src/components/MeaningPage'
import { Page } from '@/src/components/Page'
import { ReadingSection } from '@/src/components/ReadingPage'
import { Colors } from '@/src/constants/Colors'
import typography from '@/src/constants/typography'
import { useSubjectCache } from '@/src/hooks/useSubjectCache'
import { Subject, SubjectUtils } from '@/src/types/subject'
import { StringUtils } from '@/src/utils/stringUtils'
import { useLocalSearchParams } from 'expo-router'
import { toLower } from 'lodash'
import { Fragment, useMemo } from 'react'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function Index() {
  const { styles } = useStyles(stylesheet)
  const params = useLocalSearchParams<{
    id: string
  }>()
  const id = useMemo(() => [parseInt(params.id ?? '')], [params.id])
  const { subjects, isLoading } = useSubjectCache(id)
  const subject: Subject | undefined = useMemo(() => subjects[0], [subjects])

  if (isLoading) return <FullPageLoading />
  if (!subject) return <Text>Subject not found</Text>

  const associatedColor = SubjectUtils.getAssociatedColor(subject)
  const otherMeanings = subject.meanings
    .filter(e => !e.primary)
    .map(e => e.meaning)
    .map(toLower)

  return (
    <Page>
      <View style={{ alignItems: 'center' }}>
        <View
          style={[
            styles.subjectView,
            {
              backgroundColor: associatedColor,
              borderBottomColor: Colors.getBottomBorderColor(associatedColor),
            },
          ]}>
          <Text style={styles.subjectText}>{subject.characters}</Text>
        </View>
        <View style={{ height: 8 }} />
        <Text style={styles.subjectMeaning}>
          {SubjectUtils.getPrimaryMeaning(subject)?.meaning ?? ''}
        </Text>
        {otherMeanings.length > 0 && (
          <Text style={styles.subjectOtherMeanings}>
            {otherMeanings.join(', ')}
          </Text>
        )}
      </View>
      <View style={{ height: 16 }} />
      {(SubjectUtils.isVocabulary(subject) ||
        SubjectUtils.isKanji(subject)) && (
        <Fragment>
          <CompositionSection subject={subject} />
          <View style={{ height: 16 }} />
        </Fragment>
      )}
      <MeaningSection showOtherMeanings={false} subject={subject} />
      {SubjectUtils.hasReading(subject) && (
        <Fragment>
          <View style={{ height: 16 }} />
          <ReadingSection variant='extended' subject={subject} />
        </Fragment>
      )}
      {(SubjectUtils.isKanji(subject) || SubjectUtils.isRadical(subject)) && (
        <Fragment>
          <View style={{ height: 16 }} />
          <ExamplesSection subject={subject} variant='standard' />
        </Fragment>
      )}
      {(SubjectUtils.isVocabulary(subject) ||
        SubjectUtils.isKanaVocabulary(subject)) && (
        <Fragment>
          <View style={{ height: 16 }} />
          <ContextSection subject={subject} />
        </Fragment>
      )}
    </Page>
  )
  // TODO: add level info, statistics of correct answers, current learning
  // level, next review (see Progression in WaniKani)
}

const stylesheet = createStyleSheet({
  subjectView: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderBottomWidth: 4,
    paddingBottom: 8, // Subtract 4 due to border
  },
  subjectText: {
    ...typography.titleA,
    color: Colors.white,
  },
  subjectMeaning: {
    ...typography.titleB,
    height: typography.titleB.fontSize * 1.18,
  },
  subjectOtherMeanings: {
    ...typography.body,
    color: Colors.gray55,
  },
})
