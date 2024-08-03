import { appStyles } from '@/src/constants/styles'
import typography from '@/src/constants/typography'
import { Subject, SubjectUtils } from '@/src/types/subject'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

type Props = {
  subject: Subject
}

export const SubjectListItem = ({ subject }: Props) => {
  const { styles } = useStyles(stylesheet)

  const associatedColor = SubjectUtils.getAssociatedColor(subject)
  const reading =
    SubjectUtils.isKanji(subject) || SubjectUtils.isVocabulary(subject)
      ? SubjectUtils.getPrimaryReadings(subject)[0].reading
      : SubjectUtils.isKanaVocabulary(subject)
        ? subject.characters
        : undefined

  return (
    <View style={[styles.view, { backgroundColor: associatedColor }]}>
      <Text style={styles.subjectSlug}>{subject.characters}</Text>
      <View style={styles.rightSideView}>
        {reading && <Text style={styles.subjectRightText}>{reading}</Text>}
        <Text style={styles.subjectRightText}>
          {SubjectUtils.getPrimaryMeaning(subject)?.meaning}
        </Text>
      </View>
    </View>
  )
}

const stylesheet = createStyleSheet({
  view: {
    ...appStyles.rowSpaceBetween,
    borderRadius: 3,
    padding: 8,
    paddingHorizontal: 10,
  },
  rightSideView: {
    alignItems: 'flex-end',
  },
  subjectSlug: {
    ...typography.titleB,
    color: 'white',
    fontWeight: '400',
  },
  subjectRightText: {
    ...typography.titleC,
    color: 'white',
    fontWeight: '300',
  },
})
