import { Colors } from '@/src/constants/Colors'
import { appStyles } from '@/src/constants/styles'
import typography from '@/src/constants/typography'
import { Picker } from '@react-native-picker/picker'
import { useState } from 'react'
import { View, Text, SectionList } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { SettingsSectionedPage } from './SettingsSectionedPage'

export default function Index() {
  const { styles } = useStyles(stylesheet)
  const [batchSize, setBatchSize] = useState(10)
  const lessonsNumber = Array.from(Array(100).keys()).map(el => el)

  return (
    <SettingsSectionedPage
      sections={[
        {
          title: 'Preferred lesson batch size',
          footer:
            'Set the maximum number of "Today’s Lessons" you will get per day. More Lessons ultimately results in more Reviews. Adjust accordingly! You can always do more—or less—via the “Advanced” option in Lessons. The maximum value is 100 and the minimum is 0.',
          data: ['dumbItem'],
        },
      ]}
      renderItem={_ => (
        <Picker>
          {lessonsNumber.map(el => (
            <Picker.Item label={el.toString()} value={el} />
          ))}
        </Picker>
      )}
    />
  )

  return (
    <View>
      <View style={{ height: 12 }} />
      <Text></Text>

      <SectionList
        sections={[
          {
            title: 'Maximum recommended daily lessons',
            data: lessonsNumber,
          },
        ]}
        renderItem={({ item, index }) => {
          const isLast = index === lessonsNumber.length - 1
          const isFirst = index === 0
          const borderRadius = styles.item.borderRadius
          return (
            <View style={styles.itemWrapper}>
              <View
                style={[
                  styles.item,
                  {
                    borderTopLeftRadius: isFirst ? borderRadius : 0,
                    borderTopRightRadius: isFirst ? borderRadius : 0,
                    borderBottomLeftRadius: isLast ? borderRadius : 0,
                    borderBottomRightRadius: isLast ? borderRadius : 0,
                    borderBottomWidth: isLast ? 0 : 1,
                  },
                ]}>
                <Picker>
                  {lessonsNumber.map(el => (
                    <Picker.Item label={el.toString()} value={el} />
                  ))}
                </Picker>
              </View>
            </View>
          )
        }}
        renderSectionHeader={({ section }) => (
          <Text style={styles.topAndBottomText}>{section.title}</Text>
        )}
      />

      <Text style={styles.topAndBottomText}>
        Set the preferred number of new lessons to do before each lesson quiz.
        The actual number may sometimes be higher to avoid small lesson batches
        at the end.
      </Text>
    </View>
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
