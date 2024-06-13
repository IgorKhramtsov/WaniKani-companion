import { appStyles } from '@/src/constants/styles'
import typography from '@/src/constants/typography'
import { View, Text, Switch } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { SettingsSectionedPage } from './SettingsSectionedPage'
import { useSettings } from '@/src/hooks/useSettings'
import { FullPageLoading } from '@/src/components/FullPageLoading'

export default function Index() {
  const { styles } = useStyles(stylesheet)
  const { settings, setProperty, isLoading } = useSettings()

  if (isLoading) return <FullPageLoading />
  if (!settings) return <Text>Couldn't get user preferences</Text>

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
                title: 'Interleave Advanced Lessons',
                value: settings.interleave_advanced_lessons,
                onValueChange: (value: boolean) => {
                  console.log(
                    'Interleave Advanced Lessons',
                    settings.interleave_advanced_lessons,
                    value,
                  )

                  setProperty('interleave_advanced_lessons', value)
                },
              },
            ],
          },
        ]}
        renderItem={item => (
          <View style={appStyles.rowSpaceBetween}>
            <Text style={typography.body}>{item.title}</Text>
            <Switch value={item.value} onValueChange={item.onValueChange} />
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
