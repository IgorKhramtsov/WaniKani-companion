import { Colors } from '@/src/constants/Colors'
import { appStyles } from '@/src/constants/styles'
import typography from '@/src/constants/typography'
import { useState } from 'react'
import { View, Text, SectionList } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { SettingsSectionedPage } from './SettingsSectionedPage'

export default function Index() {
  const { styles } = useStyles(stylesheet)
  const [batchSize, setBatchSize] = useState(10)
  const batchSizes = Array.from(Array(11 - 3).keys()).map(el => el + 3)

  return (
    <SettingsSectionedPage
      sections={[
        {
          title: 'Preferred lesson batch size',
          footer:
            'Set the preferred number of new lessons to do before each lesson quiz. The actual number may sometimes be higher to avoid small lesson batches at the end.',
          data: batchSizes,
        },
      ]}
      renderItem={item => <Text style={styles.itemText}>{item}</Text>}
    />
  )
}

const stylesheet = createStyleSheet({
  itemText: {
    ...typography.body,
  },
})
