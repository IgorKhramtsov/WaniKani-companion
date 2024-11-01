import { Colors } from '@/src/constants/Colors'
import { appStyles } from '@/src/constants/styles'
import typography from '@/src/constants/typography'
import { router } from 'expo-router'
import { View, Text, Pressable, Switch } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { SettingsSectionedPage } from './SettingsSectionedPage'
import { AntDesign } from '@expo/vector-icons'
import { useSession } from '@/src/context/authContext'
import { FullPageLoading } from '@/src/components/FullPageLoading'
import { StringUtils } from '@/src/utils/stringUtils'
import { useSettings } from '@/src/hooks/useSettings'
import { useTabPress } from '@/src/hooks/useTabPress'
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import Toast from 'react-native-root-toast'
import { useSQLiteContext } from 'expo-sqlite'
import { dbHelper } from '@/src/utils/dbHelper'
import { asyncStorageHelper } from '@/src/utils/asyncStorageHelper'
import { LocalSettings } from '@/src/types/localSettings'
import { Preferences, defaultPreferences } from '@/src/types/preferences'

type SectionItemType = 'page' | 'switch' | 'destructiveButton'
interface SectionsData {
  title?: string
  footer?: string
  data: {
    title: string
    type: SectionItemType
    key?: keyof (LocalSettings & Preferences)
    onPress: () => void
  }[]
}

export default function Index() {
  const { styles } = useStyles(stylesheet)
  const { signOut } = useSession()
  const { settings, setProperty, isLoading } = useSettings()
  const [debugEnableCounter, setDebugEnableCounter] = useState(0)

  const db = useSQLiteContext()
  const resetDb = useCallback(async () => {
    await dbHelper.resetDb(db)
    await asyncStorageHelper.clearAll()
    Toast.show('Database has been reset', {
      duration: Toast.durations.LONG,
      position: -100,
      backgroundColor: Colors.pink,
      shadowColor: Colors.grayC5,
      shadow: true,
      animation: true,
      hideOnPress: true,
      delay: 0,
    })
  }, [db])

  useTabPress(() => {
    setDebugEnableCounter(c => c + 1)
  })

  useEffect(() => {
    if (debugEnableCounter > 5) {
      setDebugEnableCounter(0)
      setProperty('debug_mode_enabled', !settings.debug_mode_enabled)
      Toast.show(
        'Debug mode is now ' + (!settings.debug_mode_enabled ? 'on' : 'off'),
        {
          containerStyle: {
            paddingHorizontal: 32,
          },
          duration: Toast.durations.LONG,
          position: -100,
          backgroundColor: Colors.blue,
          shadowColor: Colors.grayC5,
          shadow: true,
          animation: true,
          hideOnPress: true,
          delay: 0,
        },
      )
    }
  }, [debugEnableCounter, setProperty, settings.debug_mode_enabled])

  const sectionsData: SectionsData[] = useMemo(() => {
    const sectionsData: SectionsData[] = [
      {
        title: 'Lesson',
        data: [
          {
            title: 'Preferred lesson batch size',
            type: 'page',
            key: 'lessons_batch_size',
            onPress: () => router.navigate('/(tabs)/settings/batchSize'),
          },
          {
            title: 'Maximum recommended daily lessons',
            type: 'page',
            key: 'max_lessons_per_day',
            onPress: () => router.navigate('/(tabs)/settings/maxLessons'),
          },
          {
            title: 'Interleave Advanced Lessons',
            type: 'page',
            key: 'interleave_advanced_lessons',
            onPress: () =>
              router.navigate('/(tabs)/settings/interleaveAdvancedLessons'),
          },
        ],
      },
      {
        title: 'Review',
        footer:
          'During the review session the SRS change indicator will appear for items completed.',
        data: [
          {
            title: 'SRS update indicator',
            type: 'switch',
            key: 'reviews_display_srs_indicator',
            onPress: () =>
              setProperty(
                'reviews_display_srs_indicator',
                !settings.reviews_display_srs_indicator,
              ),
          },
        ],
      },
      {
        data: [
          {
            title: 'Review ordering',
            type: 'page',
            key: 'reviews_presentation_order',
            onPress: () => router.navigate('/(tabs)/settings/reviewOrdering'),
          },
        ],
      },
      {
        title: 'Audio',
        data: [
          {
            title: 'Default voice',
            type: 'page',
            key: 'default_voice',
            onPress: () => router.navigate('/(tabs)/settings/defaultVoice'),
          },
          {
            title: 'Autoplay audio in lessons',
            type: 'switch',
            key: 'lessons_autoplay_audio',
            onPress: () =>
              setProperty(
                'lessons_autoplay_audio',
                !settings.lessons_autoplay_audio,
              ),
          },
          {
            title: 'Autoplay audio in reviews',
            type: 'switch',
            key: 'reviews_autoplay_audio',
            onPress: () =>
              setProperty(
                'reviews_autoplay_audio',
                !settings.reviews_autoplay_audio,
              ),
          },
          {
            title: 'Autoplay audio in extra study',
            type: 'switch',
            key: 'extra_study_autoplay_audio',
            onPress: () =>
              setProperty(
                'extra_study_autoplay_audio',
                !settings.extra_study_autoplay_audio,
              ),
          },
        ],
      },
      {
        title: 'Account',
        data: [
          {
            title: 'Logout',
            type: 'destructiveButton',
            onPress: signOut,
          },
        ],
      },
    ]
    if (settings.debug_mode_enabled) {
      sectionsData.push({
        title: 'Debug',
        data: [
          {
            title: 'Reset DB',
            type: 'destructiveButton',
            onPress: resetDb,
          },
        ],
      })
    }
    return sectionsData
  }, [setProperty, resetDb, settings, signOut])

  if (isLoading) return <FullPageLoading />
  if (!settings) return <Text>Couldn't get user preferences</Text>

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
        const value = item.key !== undefined ? settings[item.key] : undefined
        const valueString =
          value && typeof value === 'string'
            ? StringUtils.convertEnumTypeToString(value)
            : value
        return (
          <View style={appStyles.rowSpaceBetween}>
            <View style={appStyles.row}>
              <Text style={textStyle}>{item.title}</Text>
              {item.key &&
                Object.keys(defaultPreferences).includes(item.key) && (
                  <Fragment>
                    <View style={{ width: 8 }} />
                    <AntDesign name='sync' size={12} color={Colors.gray88} />
                  </Fragment>
                )}
            </View>
            {item.type === 'switch' && typeof value === 'boolean' && (
              <Switch value={value} onValueChange={item.onPress} />
            )}
            {item.type === 'page' && (
              <View style={appStyles.row}>
                {value && typeof value === 'string' && (
                  <Text style={styles.itemValueText}>{valueString}</Text>
                )}
                <View style={{ width: 8 }} />
                <AntDesign
                  name='right'
                  size={typography.body.fontSize}
                  color={Colors.grayC5}
                />
              </View>
            )}
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
  itemValueText: {
    ...typography.body,
    color: Colors.gray88,
  },
})
