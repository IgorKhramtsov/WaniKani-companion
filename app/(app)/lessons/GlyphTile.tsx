import { FullPageLoading } from '@/src/components/FullPageLoading'
import { Colors } from '@/src/constants/Colors'
import { appStyles } from '@/src/constants/styles'
import typography from '@/src/constants/typography'
import { useAppSelector } from '@/src/hooks/redux'
import { useSubjectCache } from '@/src/hooks/useSubjectCache'
import { SubjectUtils } from '@/src/types/subject'
import { useMemo } from 'react'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

type GlyphTileProps = {
  id: number
  variant?: 'normal' | 'compact'
}

export const GlyphTile = ({ id, variant = 'normal' }: GlyphTileProps) => {
  const { styles } = useStyles(glyphTileStylesheet)

  const { subjects, isLoading } = useSubjectCache([id], false)
  const subject = useMemo(() => subjects[0], [subjects])

  if (subject === undefined && isLoading) {
    return <FullPageLoading />
  }

  if (subject === undefined) {
    return <Text>undefined</Text>
  }

  const associatedColor = SubjectUtils.getAssociatedColor(subject)
  const resolvedTileViewStyles = [
    styles.glyphTileViewBase,
    variant === 'compact' ? styles.glyphTileViewCompact : {},
  ]
  const resolvedTileTextStyle = [
    styles.subjectTextBase,
    variant === 'compact' ? styles.subjectTextCompact : {},
  ]

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
        <Text style={resolvedTileTextStyle}>{subject?.characters}</Text>
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

const glyphTileStylesheet = createStyleSheet({
  view: {
    ...appStyles.row,
  },
  glyphTileViewBase: {
    borderRadius: 3,
    padding: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
  },
  glyphTileViewCompact: {
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
