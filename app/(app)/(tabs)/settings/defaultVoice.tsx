import typography from '@/src/constants/typography'
import { Text, Pressable, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { SettingsSectionedPage } from './SettingsSectionedPage'
import { FullPageLoading } from '@/src/components/FullPageLoading'
import { useSettings } from '@/src/hooks/useSettings'
import { FontAwesome5 } from '@expo/vector-icons'
import { appStyles } from '@/src/constants/styles'
import { Colors } from '@/src/constants/Colors'

type VoiceType =
  | 'FeminineOnly'
  | 'MasculineOnly'
  | 'PreferFeminine'
  | 'PreferMasculine'
  | 'Random'

export default function Index() {
  const { styles } = useStyles(stylesheet)
  const { preferences, setProperty, isLoading } = useSettings()
  const data: { title: string; value: VoiceType }[] = [
    {
      title: 'Feminine Only',
      value: 'FeminineOnly',
    },
    {
      title: 'Masculine Only',
      value: 'MasculineOnly',
    },
    {
      title: 'Prefer Feminine',
      value: 'PreferFeminine',
    },
    {
      title: 'Prefer Masculine',
      value: 'PreferMasculine',
    },
    {
      title: 'Random',
      value: 'Random',
    },
  ]

  if (isLoading) return <FullPageLoading />
  if (!preferences) return <Text>Couldn't get user preferences</Text>

  return (
    <SettingsSectionedPage
      sections={[
        {
          title: 'Vocabulary pronunciation voice',
          footer: 'The default voice used in Lessons and Reviews',
          data: data,
        },
      ]}
      renderItem={item => (
        <View style={appStyles.rowSpaceBetween}>
          <Text style={styles.itemText}>{item.title}</Text>
          {data[0] === item && (
            <FontAwesome5 name='check' size={16} color={Colors.blue} />
          )}
        </View>
      )}
      // TODO: local setting
      //
      // itemWrapper={(item, children) => (
      //   <Pressable onPress={() => setProperty('lessons_batch_size', item)}>
      //     {children}
      //   </Pressable>
      // )}
    />
  )
}

const stylesheet = createStyleSheet({
  itemText: {
    ...typography.body,
  },
})
