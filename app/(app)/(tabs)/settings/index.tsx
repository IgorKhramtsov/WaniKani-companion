import { Colors } from '@/src/constants/Colors'
import { appStyles } from '@/src/constants/styles'
import typography from '@/src/constants/typography'
import { router } from 'expo-router'
import { View, Text, Pressable, Switch } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { SettingsSectionedPage } from './SettingsSectionedPage'
import { AntDesign } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSession } from '@/src/context/authContext'

type SectionItemType = 'page' | 'switch' | 'destructiveButton'
interface SectionsData {
  title?: string
  footer?: string
  data: {
    title: string
    type: SectionItemType
    onPress: () => void
  }[]
}

export default function Index() {
  const { styles } = useStyles(stylesheet)
  const { signOut } = useSession()
  const sectionsData: SectionsData[] = [
    {
      title: 'Lesson',
      data: [
        {
          title: 'Preferred lesson batch size',
          type: 'page',
          onPress: () => router.navigate('/(tabs)/settings/batchSize'),
        },
        {
          title: 'Maximum recommended daily lessons',
          type: 'page',
          onPress: () => router.navigate('/(tabs)/settings/maxLessons'),
        },
      ],
    },
    {
      // TOOD: too big, move to page
      footer:
        'Interleave Lessons on the Advanced Lessons page. When set to “No,” Lessons are ordered by level, then subject type, then lesson order. When set to “Yes” we will attempt to interleave (mix item types) Lessons, if possible.',
      data: [
        {
          title: 'Interleave Advanced Lessons',
          type: 'switch',
          onPress: () => router.navigate('/(tabs)/settings/maxLessons'),
        },
      ],
    },
    {
      title: 'Review',
      footer:
        'During the review session the SRS change indicator will appear for items completed.',
      data: [
        {
          title: 'SRS update indicator during reviews',
          type: 'switch',
          onPress: () => router.navigate('/(tabs)/settings/batchSize'),
        },
      ],
    },
    {
      data: [
        {
          title: 'Review ordering',
          type: 'page',
          onPress: () => router.navigate('/(tabs)/settings/maxLessons'),
        },
      ],
    },
    {
      title: 'Audio',
      data: [
        {
          title: 'Autoplay audio in lessons',
          type: 'switch',
          onPress: () => router.navigate('/(tabs)/settings/batchSize'),
        },
        {
          title: 'Autoplay audio in reviews',
          type: 'switch',
          onPress: () => router.navigate('/(tabs)/settings/maxLessons'),
        },
        {
          title: 'Autoplay audio in extra study',
          type: 'switch',
          onPress: () => router.navigate('/(tabs)/settings/maxLessons'),
        },
      ],
    },
    {
      title: 'Account',
      data: [
        {
          title: 'Logout',
          type: 'destructiveButton',
          onPress: () => signOut(),
        },
      ],
    },
  ]

  return (
    <SettingsSectionedPage
      sections={sectionsData}
      itemWrapper={(item, children) => {
        if (item.type === 'switch') return children

        return <Pressable onPress={item.onPress}>{children}</Pressable>
      }}
      renderItem={item => {
        const textColor =
          item.type === 'destructiveButton' ? Colors.destructiveRed : undefined
        const textStyle = [styles.itemText, { color: textColor }]
        return (
          <View style={appStyles.rowSpaceBetween}>
            <Text style={textStyle}>{item.title}</Text>
            {item.type === 'switch' && <Switch />}
            {
              // TODO: show current value
              item.type === 'page' && (
                <AntDesign
                  name='right'
                  size={typography.body.fontSize}
                  color={Colors.gray}
                />
              )
            }
          </View>
        )
      }}
    />
  )
}

const stylesheet = createStyleSheet({
  itemText: {
    ...typography.body,
  },
})
