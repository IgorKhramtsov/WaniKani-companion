import { Colors } from '@/src/constants/Colors'
import { appStyles } from '@/src/constants/styles'
import typography from '@/src/constants/typography'
import { useAppSelector } from '@/src/hooks/redux'
import { selectSubject } from '@/src/redux/subjectsSlice'
import { SubjectUtils } from '@/src/types/subject'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

type GlyphTileProps = {
  id: number
}

export const GlyphTile = ({ id }: GlyphTileProps) => {
  const subject = useAppSelector(selectSubject(id))
  console.log('id: ', id, ' subj: ', subject)
  const { styles } = useStyles(glyphTileStylesheet)
  if (subject === undefined) {
    return <Text>undefined</Text>
  }

  const associatedColor = SubjectUtils.getAssociatedColor(subject)

  return (
    <View style={styles.view}>
      <View
        style={[
          styles.glyphTileView,
          {
            backgroundColor: associatedColor,
            borderBottomColor: Colors.getBottomBorderColor(associatedColor),
          },
        ]}>
        <Text style={styles.subjectText}>{subject?.characters}</Text>
      </View>
      {SubjectUtils.isKanji(subject) && (
        <View style={{ marginStart: 8 }}>
          <Text style={styles.subjectSubText}>
            {SubjectUtils.getPrimaryMeaning(subject)?.meaning}
          </Text>
        </View>
      )}
      {SubjectUtils.isRadical(subject) && (
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
  glyphTileView: {
    borderRadius: 3,
    padding: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
  },
  subjectText: {
    ...typography.titleB,
    color: 'white',
    fontWeight: '700',
  },
  subjectSubText: {
    ...typography.titleB,
    color: 'black',
    fontWeight: '300',
  },
})
