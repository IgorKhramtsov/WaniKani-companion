import { Colors } from '@/src/constants/Colors'
import { appStyles } from '@/src/constants/styles'
import typography from '@/src/constants/typography'
import { View, Text, SectionList, SectionListData } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

interface BaseSection {
  title?: string
  footer?: string
}

interface Props<ItemT, SectionT extends BaseSection> {
  sections: readonly SectionListData<ItemT, SectionT>[]

  renderItem: (item: ItemT) => any
  itemWrapper?: (item: ItemT, children: JSX.Element) => any
}

export const SettingsSectionedPage = <ItemT, SectionT extends BaseSection>({
  sections,
  renderItem,
  itemWrapper,
}: Props<ItemT, SectionT>) => {
  const { styles } = useStyles(stylesheet)

  return (
    <View>
      <SectionList
        style={{ paddingTop: 12 }}
        stickySectionHeadersEnabled={false}
        sections={sections}
        renderSectionHeader={({ section }) => (
          <View>
            {
              // SectionSeparatorComponent for some reason rendered between
              // footer and header as well. Using this as a workaround.
              sections.indexOf(section) !== 0 && <View style={{ height: 16 }} />
            }
            {section.title && (
              <Text style={styles.topAndBottomText}>{section.title}</Text>
            )}
          </View>
        )}
        renderSectionFooter={({ section }) => {
          return (
            <View>
              {section.footer && (
                <Text style={styles.topAndBottomText}>{section.footer}</Text>
              )}
              {
                // paddingBottom in the styles of SectionList doesn't work for
                // some reason. Using this as a workaround.
                sections.indexOf(section) === sections.length - 1 && (
                  <View style={{ height: 48 }} />
                )
              }
            </View>
          )
        }}
        renderItem={({ item, index, section }) => {
          const isLast = index === section.data.length - 1
          const isFirst = index === 0
          const borderRadius = styles.item.borderRadius
          const constructedItem = (
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
                {renderItem(item)}
              </View>
            </View>
          )
          if (itemWrapper) return itemWrapper(item, constructedItem)
          return constructedItem
        }}
      />
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
  topAndBottomText: {
    paddingHorizontal: 32,
    paddingVertical: 4,
    ...typography.body,
    lineHeight: typography.body.fontSize * 1.2,
    color: Colors.gray55,
  },
})
