import { Colors } from '@/src/constants/Colors'
import { appStyles } from '@/src/constants/styles'
import typography from '@/src/constants/typography'
import { useState } from 'react'
import { View, Text, SectionList, Switch } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { SettingsSectionedPage } from './SettingsSectionedPage'
import { selectPreferences } from '@/src/redux/settingsSlice'
import { useAppSelector } from '@/src/hooks/redux'

export default function Index() {
  const { styles } = useStyles(stylesheet)
  const [batchSize, setBatchSize] = useState(10)
  const [value, setValue] = useState(false)
  const preferences = useAppSelector(selectPreferences)

  return (
    <View>
      <View style={{ height: 12 }} />

      <SettingsSectionedPage
        sections={[
          {
            footer:
              'Interleave Lessons on the Advanced Lessons page. When set to “No,” Lessons are ordered by level, then subject type, then lesson order. When set to “Yes” we will attempt to interleave (mix item types) Lessons, if possible.',
            data: [
              {
                value: value,
              },
            ],
          },
        ]}
        renderItem={item => (
          <View style={appStyles.rowSpaceBetween}>
            <Text style={typography.body}>Interleave Advanced Lessons</Text>
            <Switch value={item.value} onValueChange={setValue} />
          </View>
        )}
      />
    </View>
  )
}

const stylesheet = createStyleSheet({
  itemText: {
    ...typography.body,
  },
})
