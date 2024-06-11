import { Colors } from '@/src/constants/Colors'
import { appStyles } from '@/src/constants/styles'
import typography from '@/src/constants/typography'
import { Picker } from '@react-native-picker/picker'
import { Text } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { SettingsSectionedPage } from './SettingsSectionedPage'
import { useSettings } from '@/src/hooks/useSettings'
import { FullPageLoading } from '@/src/components/FullPageLoading'

export default function Index() {
  const { styles } = useStyles(stylesheet)
  const { preferences, setProperty, isLoading } = useSettings()
  const lessonsNumber = Array.from(Array(100).keys()).map(el => el)

  if (isLoading) return <FullPageLoading />
  if (!preferences) return <Text>Couldn't get user preferences</Text>

  return (
    <SettingsSectionedPage
      sections={[
        {
          title: 'Maximum recommended daily lessons',
          footer:
            'Set the maximum number of "Today’s Lessons" you will get per day. More Lessons ultimately results in more Reviews. Adjust accordingly! You can always do more—or less—via the “Advanced” option in Lessons. The maximum value is 100 and the minimum is 0.',
          data: ['dumbItem'],
        },
      ]}
      renderItem={_ => (
        <Picker
          // TODO: local setting
          selectedValue={15}
          // selectedValue={preferences.lessons_batch_size}
          // onValueChange={value => setProperty('', value)}
        >
          {lessonsNumber.map(el => (
            <Picker.Item key={el} label={el.toString()} value={el} />
          ))}
        </Picker>
      )}
    />
  )
}

const stylesheet = createStyleSheet({
  itemWrapper: {
    ...appStyles.row,
    width: '100%',
    paddingHorizontal: 16,
  },
  item: {
    width: '100%',
    justifyContent: 'center',
    backgroundColor: 'white',
    minHeight: 42,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderBottomColor: Colors.grayEA,
  },
  itemText: {
    ...typography.body,
  },
  topAndBottomText: {
    paddingHorizontal: 32,
    paddingVertical: 4,
    ...typography.body,
    lineHeight: typography.body.fontSize * 1.2,
    color: Colors.gray55,
  },
})
