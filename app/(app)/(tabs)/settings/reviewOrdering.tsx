import { Colors } from '@/src/constants/Colors'
import { appStyles } from '@/src/constants/styles'
import typography from '@/src/constants/typography'
import { useState } from 'react'
import { View, Text, SectionList, Pressable } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { SettingsSectionedPage } from './SettingsSectionedPage'
import { Preferences, ReviewsPresentationOrder } from '@/src/types/preferences'
import { FontAwesome5 } from '@expo/vector-icons'

export default function Index() {
  const { styles } = useStyles(stylesheet)
  const [batchSize, setBatchSize] = useState(10)
  const [value, setValue] = useState<ReviewsPresentationOrder>('shuffled')
  const data: { title: string; value: ReviewsPresentationOrder }[] = [
    {
      title: 'Shuffled',
      value: 'shuffled',
    },
    {
      title: 'Lower levels first',
      value: 'lower_levels_first',
    },
  ]

  return (
    <SettingsSectionedPage
      sections={[
        {
          title: 'Review ordering',
          footer:
            'Set the ordering of reviews. Shuffled presents in random order. Lower levels first is still random but prioritizes lower level subjects first.',
          data: data,
        },
      ]}
      renderItem={item => (
        <View style={appStyles.rowSpaceBetween}>
          <Text style={styles.itemText}>{item.title}</Text>
          {value === item.value && (
            <FontAwesome5 name='check' size={16} color={Colors.blue} />
          )}
        </View>
      )}
      itemWrapper={(item, children) => (
        <Pressable onPress={() => setValue(item.value)}>{children}</Pressable>
      )}
    />
  )
}

const stylesheet = createStyleSheet({
  itemText: {
    ...typography.body,
  },
})
