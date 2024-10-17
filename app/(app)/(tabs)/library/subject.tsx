import { useGetReviewStatisticQuery } from '@/src/api/localDb/api'
import { useGetAssignmentForSubjectQuery } from '@/src/api/localDb/assignment'
import { CompositionSection } from '@/src/components/CompositionPage'
import { ContextSection } from '@/src/components/ContextPage'
import { ExamplesSection } from '@/src/components/ExamplesPage'
import { FullPageLoading } from '@/src/components/FullPageLoading'
import { MeaningSection } from '@/src/components/MeaningPage'
import { ReadingSection } from '@/src/components/ReadingPage'
import { SubjectSymbol } from '@/src/components/SubjectSymbol'
import { Colors } from '@/src/constants/Colors'
import { appStyles } from '@/src/constants/styles'
import typography from '@/src/constants/typography'
import { useSubjectCache } from '@/src/hooks/useSubjectCache'
import { srsStageToColor, srsStageToMilestone } from '@/src/types/assignment'
import { Subject, SubjectUtils } from '@/src/types/subject'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import { toLower } from 'lodash'
import { Fragment, useLayoutEffect, useMemo } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function Index() {
  const { styles } = useStyles(stylesheet)
  const navigation = useNavigation()
  const params = useLocalSearchParams<{
    id: string
  }>()
  const id = useMemo(() => [parseInt(params.id ?? '')], [params.id])
  const { subjects, isLoading } = useSubjectCache(id)
  const subject = useMemo((): Subject | undefined => subjects[0], [subjects])

  const { isLoading: isAssignmentLoading, data: assignment } =
    useGetAssignmentForSubjectQuery(subject?.id ?? -1, { skip: !subject?.id })
  const { isLoading: isReviewStatisticLoading, data: reviewStatistic } =
    useGetReviewStatisticQuery(subject?.id ?? -1, { skip: !subject?.id })

  const stageName = useMemo(
    () => srsStageToMilestone(assignment?.srs_stage),
    [assignment?.srs_stage],
  )
  const stageColor = useMemo(
    () => srsStageToColor(assignment?.srs_stage),
    [assignment?.srs_stage],
  )
  const associatedColor = useMemo(
    () => (subject ? SubjectUtils.getAssociatedColor(subject) : undefined),
    [subject],
  )
  const otherMeanings = useMemo(
    () =>
      subject?.meanings
        .filter(e => !e.primary)
        .map(e => e.meaning)
        .map(toLower),
    [subject?.meanings],
  )

  useLayoutEffect(() => {
    navigation.setOptions({
      title:
        subject && SubjectUtils.isRadical(subject)
          ? subject.meanings[0]?.meaning
          : subject?.characters,
    })
  }, [navigation, subject])

  if (isLoading || isAssignmentLoading || isReviewStatisticLoading)
    return <FullPageLoading />
  if (!subject) return <Text>Subject not found</Text>

  // TODO: make header expandable? So that it collapse to just characters when
  // scrolled
  return (
    <ScrollView contentContainerStyle={styles.pageView}>
      <Fragment>
        {stageName && (
          <View
            style={[
              styles.stageBar,
              {
                backgroundColor: stageColor,
                borderBottomColor: Colors.getBottomBorderColor(stageColor),
              },
            ]}>
            {stageName && <Text style={styles.stageText}>{stageName}</Text>}
            {reviewStatistic && (
              <Text style={styles.stageText}>
                🎯{reviewStatistic?.percentage_correct}%
              </Text>
            )}
          </View>
        )}
        <View style={{ height: 12 }} />
        <View style={{ alignItems: 'center' }}>
          <View style={{ flexDirection: 'row' }}>
            <View
              style={[
                styles.subjectView,
                {
                  paddingHorizontal: 10,
                  backgroundColor: Colors.gray55,
                  borderBottomColor: Colors.getBottomBorderColor(Colors.gray55),
                },
              ]}>
              <Text style={styles.subjectText}>L{subject.level}</Text>
            </View>
            <View style={{ width: 4 }} />
            <View style={{ alignItems: 'center' }}>
              <View
                style={[
                  styles.subjectView,
                  {
                    backgroundColor: associatedColor,
                    borderBottomColor:
                      Colors.getBottomBorderColor(associatedColor),
                  },
                ]}>
                <SubjectSymbol
                  textStyle={styles.subjectText}
                  subject={subject}
                />
              </View>
            </View>
          </View>
          <View style={{ height: 8 }} />
          <Text style={styles.subjectMeaning}>
            {SubjectUtils.getPrimaryMeaning(subject)?.meaning ?? ''}
          </Text>
          {(otherMeanings?.length ?? 0) > 0 && (
            <Text style={styles.subjectOtherMeanings}>
              {otherMeanings?.join(', ')}
            </Text>
          )}
        </View>
      </Fragment>
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
    </ScrollView>
  )
  // TODO: add level info, statistics of correct answers, current learning
  // level, next review (see Progression in WaniKani)
}

const stylesheet = createStyleSheet({
  pageView: {
    padding: 20,
    paddingTop: 10,
  },
  stageBar: {
    ...appStyles.rowSpaceBetween,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderBottomWidth: 2,
    paddingBottom: 2, // Subtract 2 due to border
  },
  stageText: {
    ...typography.body,
    color: Colors.white,
  },
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
