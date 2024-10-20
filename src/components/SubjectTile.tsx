import { FullPageLoading } from '@/src/components/FullPageLoading'
import { Colors } from '@/src/constants/Colors'
import { appStyles } from '@/src/constants/styles'
import typography from '@/src/constants/typography'
import { useSubjectCache } from '@/src/hooks/useSubjectCache'
import { Subject, SubjectUtils } from '@/src/types/subject'
import { useRouter } from 'expo-router'
import { useMemo } from 'react'
import { Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { SubjectSymbol } from './SubjectSymbol'

type IdProps = {
  id: number
}
type SubjectProps = {
  subject: Subject
}

type Props = (IdProps | SubjectProps) & {
  variant?: 'extended' | 'normal' | 'compact'
  isPressable?: boolean
}

export const SubjectTile = ({
  isPressable = true,
  variant = 'normal',
  ...props
}: Props) => {
  const { styles } = useStyles(glyphTileStylesheet)
  const router = useRouter()

  const id = 'id' in props ? props.id : undefined
  const ids = useMemo(() => (id !== undefined ? [id] : []), [id])
  const { subjects, isLoading } = useSubjectCache(ids, false)
  const subject = useMemo(
    () => ('subject' in props ? props.subject : subjects[0]),
    [props, subjects],
  )

  if (subject === undefined && isLoading) {
    return <FullPageLoading />
  }

  if (subject === undefined) {
    return <Text>undefined</Text>
  }

  const associatedColor = SubjectUtils.getAssociatedColor(subject)
  const reading =
    SubjectUtils.isKanji(subject) || SubjectUtils.isVocabulary(subject)
      ? SubjectUtils.getPrimaryReadings(subject)[0].reading
      : SubjectUtils.isKanaVocabulary(subject)
        ? subject.characters
        : undefined
  const resolvedTileViewStyles = [
    styles.viewBase,
    variant === 'compact' ? styles.viewCompact : {},
  ]
  const resolvedTileTextStyle = [
    styles.subjectTextBase,
    variant === 'compact' ? styles.subjectTextCompact : {},
  ]

  const node = (() => {
    if (variant === 'extended') {
      return (
        <View
          style={[styles.extendedView, { backgroundColor: associatedColor }]}>
          <SubjectSymbol textStyle={styles.subjectSymbol} subject={subject} />
          <View style={styles.rightSideView}>
            {reading && <Text style={styles.subjectRightText}>{reading}</Text>}
            <Text style={styles.subjectRightText}>
              {SubjectUtils.getPrimaryMeaning(subject)?.meaning}
            </Text>
          </View>
        </View>
      )
    } else {
      return (
        <View style={styles.view}>
          <View
            style={[
              resolvedTileViewStyles,
              {
                backgroundColor: associatedColor,
                borderBottomColor: Colors.getBottomBorderColor(associatedColor),
              },
            ]}>
            <SubjectSymbol
              textStyle={resolvedTileTextStyle}
              subject={subject}
            />
          </View>
          {variant === 'normal' && (
            <View style={{ marginStart: 8 }}>
              <Text style={styles.subjectSubText}>
                {SubjectUtils.getPrimaryMeaning(subject)?.meaning}
              </Text>
            </View>
          )}
        </View>
      )
    }
  })()

  if (!isPressable) {
    return node
  }

  return (
    <Pressable
      disabled={!isPressable}
      onPress={() =>
        router.push({
          pathname: '/(tabs)/library/subject',
          params: { id: subject.id },
        })
      }>
      {node}
    </Pressable>
  )
}

const glyphTileStylesheet = createStyleSheet({
  extendedView: {
    ...appStyles.rowSpaceBetween,
    borderRadius: 3,
    padding: 8,
    paddingHorizontal: 10,
  },
  rightSideView: {
    alignItems: 'flex-end',
  },
  subjectSymbol: {
    ...typography.titleB,
    color: 'white',
    fontWeight: '400',
  },
  subjectRightText: {
    ...typography.titleC,
    color: 'white',
    fontWeight: '300',
  },

  view: {
    ...appStyles.row,
  },
  viewBase: {
    borderRadius: 3,
    padding: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
  },
  viewCompact: {
    padding: 4,
    paddingHorizontal: 10,
    borderBottomWidth: 2,
  },
  subjectTextBase: {
    ...typography.titleB,
    color: 'white',
    // 500 looks too thick
    fontWeight: '400',
  },
  subjectTextCompact: {
    ...typography.titleC,
    fontWeight: '400',
  },
  subjectSubText: {
    ...typography.titleB,
    color: 'black',
    fontWeight: '300',
  },
})
