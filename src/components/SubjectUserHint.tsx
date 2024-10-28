import { useGetStudyMaterialsQuery } from '@/src/api/localDb/api'
import {
  useCreateStudyMaterialMutation,
  useUpdateStudyMaterialMutation,
} from '@/src/api/wanikaniApi'
import { Colors } from '@/src/constants/Colors'
import { appStyles } from '@/src/constants/styles'
import typography from '@/src/constants/typography'
import { useSubjectCache } from '@/src/hooks/useSubjectCache'
import { Subject } from '@/src/types/subject'
import { FontAwesome6 } from '@expo/vector-icons'
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
  TextInputKeyPressEventData,
  TextInputSubmitEditingEventData,
  View,
} from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

type Props = {
  subjectId: number
}
type GenericProps = Props & {
  propName: 'meaning_note' | 'reading_note'
}

export type SubjectUserHintRef = {
  focus: () => void
}

export const SubjectUserMeaningHint = forwardRef<SubjectUserHintRef, Props>(
  ({ subjectId }, ref: ForwardedRef<SubjectUserHintRef>) => {
    return (
      <SubjectUserHint
        subjectId={subjectId}
        propName={'meaning_note'}
        ref={ref}
      />
    )
  },
)
SubjectUserMeaningHint.displayName = 'SubjectUserMeaningHint'

export const SubjectUserReadingHint = forwardRef<SubjectUserHintRef, Props>(
  ({ subjectId }, ref: ForwardedRef<SubjectUserHintRef>) => {
    return (
      <SubjectUserHint
        subjectId={subjectId}
        propName='reading_note'
        ref={ref}
      />
    )
  },
)
SubjectUserReadingHint.displayName = 'SubjectUserReadingHint'

const SubjectUserHint = forwardRef<SubjectUserHintRef, GenericProps>(
  ({ subjectId, propName: key }, ref: ForwardedRef<SubjectUserHintRef>) => {
    const { styles } = useStyles(stylesheet)
    const inputRef = useRef<TextInput>(null)

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
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

    const note = useMemo(() => studyMaterial?.[key] ?? '', [studyMaterial, key])

    const [noteValue, setNoteValue] = useState(note)
    const [inputFocused, setInputFocused] = useState(false)
    const onFocus = useCallback(() => {
      setInputFocused(true)
    }, [setInputFocused])
    const onBlur = useCallback(() => {
      setNoteValue(prev => prev.trim())
      setInputFocused(false)
    }, [setInputFocused])
    const onSubmitEditing = useCallback(
      (_: NativeSyntheticEvent<TextInputSubmitEditingEventData>) =>
        inputRef.current?.blur(),
      [],
    )
    const onKeyPress = useCallback(
      (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
        const key = e.nativeEvent.key
        if (key === 'Enter') {
          inputRef.current?.blur()
          e.preventDefault()
        }
      },
      [],
    )
    const onChange = useCallback(
      (e: NativeSyntheticEvent<TextInputChangeEventData>) => {
        let text = e.nativeEvent.text

        setNoteValue(text)
      },
      [setNoteValue],
    )
    // This ensures we save the note only when the user is done typing
    const noteValueForSave = useMemo(
      () => (inputFocused ? undefined : noteValue),
      [inputFocused, noteValue],
    )
    useAutosave({
      interval: 100,
      data: noteValueForSave,
      onSave: data => {
        if (data === undefined) return
        if (data === note) return

        console.log('saving note', note, data)
        try {
          if (studyMaterial) {
            const data = Object.assign({}, studyMaterial ?? {}) as any
            data[key] = noteValueForSave
            updateStudyMaterials(data).unwrap()
          } else {
            if (!subject) {
              console.error('Subject is not defined. Tried to save user note')
              return
            }
            const data = {
              subject_id: subject.id,
            } as any
            data[key] = noteValueForSave
            createStudyMaterials(data).unwrap()
          }
        } catch (e) {
          console.error('Failed to save study material', e)
          // Reset note value if saving fails
          setNoteValue(note)
        }
      },
      saveOnUnmount: true,
    })

    if (isLoading) return null

    return (
      <Pressable onPress={() => inputRef.current?.focus()}>
        <View style={appStyles.row}>
          <Text style={styles.title}>Note</Text>
          <View style={{ width: 8 }} />
          <FontAwesome6 name='edit' size={18} color={Colors.gray55} />
        </View>
        <View style={styles.inputView}>
          <TextInput
            style={styles.input}
            ref={inputRef}
            multiline={true}
            value={noteValue}
            blurOnSubmit={false}
            autoCorrect={false}
            onFocus={onFocus}
            onBlur={onBlur}
            onChange={onChange}
            onSubmitEditing={onSubmitEditing}
            onKeyPress={onKeyPress}
          />
          {noteValue.length === 0 && (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholder}>Tap to edit</Text>
            </View>
          )}
        </View>
      </Pressable>
    )
  },
)

SubjectUserHint.displayName = 'SubjectUserHint'

const stylesheet = createStyleSheet({
  title: {
    ...typography.titleC,
    fontWeight: '300',
  },
  inputView: {
    position: 'relative',
  },
  input: {
    ...typography.body,
    color: Colors.gray55,
  },
  placeholderContainer: {
    ...appStyles.row,
    position: 'absolute',
    bottom: 0,
    top: 0,
  },
  placeholder: {
    ...typography.body,
    fontWeight: '300',
    height: typography.body.fontSize * 1.38,
    color: Colors.gray88,
  },
})
