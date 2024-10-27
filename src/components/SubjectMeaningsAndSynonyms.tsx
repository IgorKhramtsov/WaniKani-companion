import { useGetStudyMaterialsQuery } from '@/src/api/localDb/api'
import {
  useCreateStudyMaterialMutation,
  useUpdateStudyMaterialMutation,
} from '@/src/api/wanikaniApi'
import { Colors } from '@/src/constants/Colors'
import { appStyles } from '@/src/constants/styles'
import typography from '@/src/constants/typography'
import { useSubjectCache } from '@/src/hooks/useSubjectCache'
import { StudyMaterial } from '@/src/types/studyMaterial'
import { Subject } from '@/src/types/subject'
import { arraysEqual } from '@/src/utils/arrayUtils'
import { FontAwesome6 } from '@expo/vector-icons'
import { toLower } from 'lodash'
import {
  ForwardedRef,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useAutosave } from 'react-autosave'
import {
  NativeSyntheticEvent,
  Pressable,
  Text,
  TextInput,
  TextInputChangeEventData,
  TextInputSelectionChangeEventData,
  TextInputSubmitEditingEventData,
  View,
} from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

type Props = {
  subjectId: number
}
export type SubjectMeaningsAndSynonymsRef = {
  focus: () => void
}

export const SubjectMeaningsAndSynonyms = forwardRef<
  SubjectMeaningsAndSynonymsRef,
  Props
>(({ subjectId }, ref: ForwardedRef<SubjectMeaningsAndSynonymsRef>) => {
  const { styles } = useStyles(stylesheet)
  const synonymInputRef = useRef<TextInput>(null)

  useImperativeHandle(ref, () => ({
    focus: () => synonymInputRef.current?.focus(),
  }))

  const { subjects, isLoading: isSubjectsLoading } = useSubjectCache([
    subjectId,
  ])
  const subject = useMemo((): Subject | undefined => subjects[0], [subjects])
  const { isLoading: isStudyMaterialLoading, data: studyMaterials } =
    useGetStudyMaterialsQuery([subjectId])
  const studyMaterial = useMemo(() => studyMaterials?.[0], [studyMaterials])

  const isLoading = useMemo(
    () => isSubjectsLoading || isStudyMaterialLoading,
    [isSubjectsLoading, isStudyMaterialLoading],
  )

  const [createStudyMaterials] = useCreateStudyMaterialMutation()
  const [updateStudyMaterials] = useUpdateStudyMaterialMutation()

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
  const onFocus = useCallback(() => {
    // If there are no predefined meanings, we don't need to show the comma
    if (otherPredefinedMeanings.length === 0 && synonymsValue.length === 0) {
      // add empty whitespace at the end to track backspace
      setSynonymsValue(prev => prev + ' ')
      return
    }

    setSynonymsValue(prev => prev + ', ')
    setSynonymsInputFocused(true)
  }, [otherPredefinedMeanings, synonymsValue, setSynonymsValue])
  const onBlur = useCallback(() => {
    setSynonymsValue(prev => {
      if (prev.trim().endsWith(',')) {
        return prev.trim().slice(0, -1)
      }
      return prev.trim()
    })
    setSynonymsInputFocused(false)
  }, [setSynonymsInputFocused, setSynonymsValue])
  const onSubmitEditing = useCallback(
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
  const onSelectionChange = useCallback(
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
  const onChange = useCallback(
    (e: NativeSyntheticEvent<TextInputChangeEventData>) => {
      let text = e.nativeEvent.text
      // If user moved selection before comma and removed everything - clear
      // the comma (and probably it will be blurred)
      if (otherPredefinedMeanings.length === 0 && text.trim().startsWith(',')) {
        text = text.trim().slice(1).trim()
      }

      text = text.replaceAll(',,', ',')

      if (text.trim().length === 0) {
        synonymInputRef.current?.blur()
      }
      setSynonymsValue(text)
    },
    [otherPredefinedMeanings, setSynonymsValue],
  )
  // This ensures we save the synonyms only when the user is done typing
  const synonymsValueForSave = useMemo(
    () => (synonymsInputFocused ? undefined : synonymsValue),
    [synonymsInputFocused, synonymsValue],
  )
  useAutosave({
    interval: 100,
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

  if (isLoading) return null

  return (
    <Pressable onPress={() => synonymInputRef.current?.focus()}>
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
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={onChange}
          onSubmitEditing={onSubmitEditing}
          onSelectionChange={onSelectionChange}
        />
        {(otherPredefinedMeanings.length > 0 || synonymsValue.length > 0) && (
          <View style={{ width: 8 }} />
        )}
        <FontAwesome6 name='edit' size={18} color={Colors.gray55} />
      </View>
    </Pressable>
  )
})

SubjectMeaningsAndSynonyms.displayName = 'SubjectMeaningsAndSynonyms'

const stylesheet = createStyleSheet({
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
