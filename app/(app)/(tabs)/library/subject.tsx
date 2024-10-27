import {
  useGetReviewStatisticQuery,
  useGetStudyMaterialsQuery,
} from '@/src/api/localDb/api'
import { useGetAssignmentForSubjectQuery } from '@/src/api/localDb/assignment'
import {
  useCreateStudyMaterialMutation,
  useUpdateStudyMaterialMutation,
} from '@/src/api/wanikaniApi'
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
import { StudyMaterial } from '@/src/types/studyMaterial'
import { Subject, SubjectUtils } from '@/src/types/subject'
import { arraysEqual } from '@/src/utils/arrayUtils'
import { FontAwesome, FontAwesome6 } from '@expo/vector-icons'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import { toLower } from 'lodash'
import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useAutosave } from 'react-autosave'
import {
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TextInputChangeEventData,
  TextInputKeyPressEventData,
  TextInputSelectionChangeEventData,
  TextInputSubmitEditingEventData,
  View,
} from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function Index() {
  const { styles } = useStyles(stylesheet)
  const navigation = useNavigation()
  const params = useLocalSearchParams<{
    id: string
  }>()
  const ids = useMemo(() => [parseInt(params.id ?? '')], [params.id])
  const synonymInputRef = useRef<TextInput>(null)

  const { subjects, isLoading: isSubjectsLoading } = useSubjectCache(ids)
  const subject = useMemo((): Subject | undefined => subjects[0], [subjects])

  const { isLoading: isAssignmentLoading, data: assignment } =
    useGetAssignmentForSubjectQuery(subject?.id ?? -1, { skip: !subject?.id })
  const { isLoading: isReviewStatisticLoading, data: reviewStatistic } =
    useGetReviewStatisticQuery(subject?.id ?? -1, { skip: !subject?.id })
  const { isLoading: isStudyMaterialLoading, data: studyMaterials } =
    useGetStudyMaterialsQuery(ids)
  const [createStudyMaterials] = useCreateStudyMaterialMutation()
  const [updateStudyMaterials] = useUpdateStudyMaterialMutation()

  const studyMaterial = useMemo(() => studyMaterials?.[0], [studyMaterials])
  const otherPredefinedMeanings = useMemo(
    () =>
      subject?.meanings
        .filter(e => !e.primary)
        .map(e => e.meaning)
        .map(toLower) ?? [],
    [subject?.meanings],
  )
  const userSynonyms = useMemo(
    () => (studyMaterial?.meaning_synonyms ?? []).map(toLower),
    [studyMaterial?.meaning_synonyms],
  )

  const [synonymsValue, setSynonymsValue] = useState(userSynonyms.join(', '))
  const [synonymsInputFocused, setSynonymsInputFocused] = useState(false)
  const onSynonymsInputFocus = useCallback(() => {
    // If there are no predefined meanings, we don't need to show the comma
    if (
      otherPredefinedMeanings.length === 0 &&
      userSynonyms.length === 0 &&
      synonymsValue.length === 0
    ) {
      // add empty whitespace at the end to track backspace
      setSynonymsValue(prev => prev + ' ')
      return
    }

    setSynonymsValue(prev => prev + ', ')
    setSynonymsInputFocused(true)
  }, [otherPredefinedMeanings, userSynonyms, synonymsValue, setSynonymsValue])
  const onSynonymsInputBlur = useCallback(() => {
    setSynonymsValue(prev => {
      if (prev.trim().endsWith(',')) {
        return prev.trim().slice(0, -1)
      }
      return prev
    })
    setSynonymsInputFocused(false)
  }, [setSynonymsInputFocused, setSynonymsValue])
  const synonymSubmitPressed = useCallback(
    (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
      const text = e.nativeEvent.text
      if (text.trim().endsWith(',') || text.trim().length === 0) {
        synonymInputRef.current?.blur()
      } else {
        setSynonymsValue(prev => `${prev}, `)
      }
    },
    [],
  )
  const synonymSelectionChange = useCallback(
    (e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
      const selection = e.nativeEvent.selection
      if (synonymsValue.startsWith(' ') && selection.start < 1) {
        setTimeout(() => {
          if (synonymInputRef.current) {
            synonymInputRef.current?.setSelection(1, Math.max(selection.end, 1))
          }
        }, 0)
      }
    },
    [synonymsValue],
  )
  const synonymsOnChange = useCallback(
    (e: NativeSyntheticEvent<TextInputChangeEventData>) => {
      const text = e.nativeEvent.text
      if (text.trim().length === 0) {
        synonymInputRef.current?.blur()
      }
      setSynonymsValue(text)
    },
    [setSynonymsValue],
  )
  // This ensures we save the synonyms only when the user is done typing
  const synonymsValueForSave = useMemo(
    () => (synonymsInputFocused ? undefined : synonymsValue),
    [synonymsInputFocused, synonymsValue],
  )
  useAutosave({
    data: synonymsValueForSave,
    onSave: data => {
      if (data === undefined) return
      const synonyms = data
        .split(',')
        .map(e => e.trim())
        .filter(e => e.length > 0)
      console.log('synonyms', synonyms)
      if (arraysEqual(userSynonyms, synonyms)) return

      console.log('saving synonyms', userSynonyms, synonyms)
      try {
        if (studyMaterial) {
          updateStudyMaterials({
            ...studyMaterial,
            meaning_synonyms: synonyms,
          }).unwrap()
        } else {
          if (!subject) {
            console.error('Subject is not defined. Tried to save user synonyms')
            return
          }
          createStudyMaterials({
            subject_id: subject.id,
            meaning_synonyms: synonyms,
          } as StudyMaterial).unwrap()
        }
      } catch (e) {
        console.error('Failed to save study material', e)
        // Reset synonyms value if saving fails
        setSynonymsValue(userSynonyms.join(', '))
      }
    },
    saveOnUnmount: true,
  })

  const isLoading = useMemo(
    () =>
      isSubjectsLoading ||
      isStudyMaterialLoading ||
      isAssignmentLoading ||
      isReviewStatisticLoading,
    [
      isSubjectsLoading,
      isStudyMaterialLoading,
      isAssignmentLoading,
      isReviewStatisticLoading,
    ],
  )

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

  useLayoutEffect(() => {
    navigation.setOptions({
      title:
        subject && SubjectUtils.isRadical(subject)
          ? subject.meanings[0]?.meaning
          : subject?.characters,
    })
  }, [navigation, subject])

  if (isLoading) return <FullPageLoading />
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
          <Pressable
            style={{ alignItems: 'center' }}
            onPress={() => synonymInputRef.current?.focus()}>
            <Text style={styles.subjectMeaning}>
              {SubjectUtils.getPrimaryMeaning(subject)?.meaning ?? ''}
            </Text>
            <View style={appStyles.row}>
              {otherPredefinedMeanings.length > 0 && (
                <Text style={styles.subjectOtherMeanings}>
                  {otherPredefinedMeanings?.join(', ')}
                </Text>
              )}
              <TextInput
                style={styles.subjectOtherMeaningsInput}
                ref={synonymInputRef}
                value={synonymsValue}
                blurOnSubmit={false}
                autoCorrect={false}
                autoCapitalize='none'
                onFocus={onSynonymsInputFocus}
                onBlur={onSynonymsInputBlur}
                onChange={synonymsOnChange}
                onSubmitEditing={synonymSubmitPressed}
                onSelectionChange={synonymSelectionChange}
              />
              <View style={{ width: 8 }} />
              <FontAwesome6 name='edit' size={18} color={Colors.gray55} />
            </View>
          </Pressable>
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
    height: typography.titleB.fontSize,
  },
  subjectOtherMeanings: {
    ...typography.body,
    height: typography.body.fontSize * 1.18,
    color: Colors.gray55,
  },
  subjectOtherMeaningsInput: {
    ...typography.body,
    color: Colors.gray55,
  },
})
