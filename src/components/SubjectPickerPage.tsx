import { SubjectTile } from '@/src/components/SubjectTile'
import { Colors } from '@/src/constants/Colors'
import { appStyles } from '@/src/constants/styles'
import typography from '@/src/constants/typography'
import { Subject } from '@/src/types/subject'
import { Fragment, useCallback, useState } from 'react'
import {
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { useSafeArea } from 'react-native-safe-area-context'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { BlurView } from 'expo-blur'
import Collapsible from './Collapsible'

const MAX_CATEGORY_HEIGHT = 84

export type Category = {
  name: string
  children: Category[] | Subject[]
}

const isCategoryArray = (
  children: Category[] | Subject[],
): children is Category[] => children.length > 0 && 'name' in children[0]

type SubjectPickerPageProps = {
  categories: Category[]
  bottomBarBuilder: (selectedIds: number[]) => React.ReactNode
  expandable?: boolean
}

export const SubjectPickerPage = ({
  categories,
  bottomBarBuilder,
  expandable = false,
}: SubjectPickerPageProps) => {
  const { styles } = useStyles(stylesheet)
  const { bottom: bottomSafePadding } = useSafeArea()
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [bottomBarHeight, setBottomBarHeight] = useState(0)

  const toggleSelected = useCallback(
    (id: number) => {
      setSelectedIds(prev =>
        prev.includes(id) ? prev.filter(el => el !== id) : [...prev, id],
      )
    },
    [setSelectedIds],
  )
  const selectAll = useCallback(
    (ids: number[]) => setSelectedIds(prev => [...new Set([...prev, ...ids])]),
    [setSelectedIds],
  )
  const deselectAll = useCallback(
    (ids: number[]) =>
      setSelectedIds(prev => prev.filter(el => !ids.includes(el))),
    [setSelectedIds],
  )

  return (
    <>
      <ScrollView style={styles.pageView}>
        {categories.map(topCategory => {
          const childrenCategories = isCategoryArray(topCategory.children)
            ? topCategory.children
            : [topCategory]
          return (
            <View key={topCategory.name} style={styles.topCategoryView}>
              {
                // Show title only if we have one more level of categories
                isCategoryArray(topCategory.children) && (
                  <Text style={styles.viewText}>{topCategory.name}</Text>
                )
              }
              {childrenCategories.map((category, i) => {
                if (isCategoryArray(category.children)) {
                  throw 'Only 1 nested category is supported'
                }
                const subjects = category.children
                const subjectIds = subjects.map(e => e.id)
                const isAllSelected = subjectIds.every(e =>
                  selectedIds.includes(e),
                )
                return (
                  <Fragment key={category.name}>
                    <View style={styles.categoryView}>
                      <View style={appStyles.rowSpaceBetween}>
                        <Text style={styles.viewText}>{category.name}</Text>
                        <Pressable
                          onPress={() =>
                            isAllSelected
                              ? deselectAll(subjectIds)
                              : selectAll(subjectIds)
                          }>
                          <Text style={styles.selectAllText}>
                            Select {isAllSelected ? 'None' : 'All'}
                          </Text>
                        </Pressable>
                      </View>
                      <Collapsible
                        disabled={!expandable}
                        previewHeight={MAX_CATEGORY_HEIGHT}
                        buttonBuilder={(expanded: boolean) => (
                          <View style={styles.showMoreButton}>
                            <Text style={styles.showMoreButtonText}>
                              {expanded ? 'Show Less' : 'Show More'}
                            </Text>
                          </View>
                        )}>
                        <View style={styles.subjectsRow}>
                          {subjects.map(subject => {
                            const isSelected = selectedIds.includes(subject.id)
                            return (
                              <Pressable
                                key={subject.id}
                                onPress={() => toggleSelected(subject.id)}>
                                <View
                                  style={[
                                    styles.subjectTile,
                                    { opacity: isSelected ? 1.0 : 0.55 },
                                  ]}>
                                  <SubjectTile
                                    subject={subject}
                                    variant='compact'
                                    isPressable={false}
                                  />
                                </View>
                              </Pressable>
                            )
                          })}
                        </View>
                      </Collapsible>
                    </View>
                    {i < childrenCategories.length - 1 && (
                      <View style={{ height: 16 }} />
                    )}
                  </Fragment>
                )
              })}
            </View>
          )
        })}
        <View style={{ height: bottomBarHeight + 24 }} />
      </ScrollView>
      <BlurView
        onLayout={e => setBottomBarHeight(e.nativeEvent.layout.height)}
        style={[styles.bottomBar, { paddingBottom: bottomSafePadding }]}>
        {bottomBarBuilder(selectedIds)}
      </BlurView>
    </>
  )
}

const stylesheet = createStyleSheet({
  pageView: {
    flex: 1,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 16,
    alignItems: 'center',
  },
  viewText: {
    ...typography.titleC,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  selectAllText: {
    ...typography.body,
    color: Colors.pink,
  },
  topCategoryView: {
    padding: 8,
    borderRadius: 8,
  },
  categoryView: {
    backgroundColor: Colors.white,
    padding: 8,
    borderRadius: 8,
  },
  subjectsRow: {
    ...appStyles.row,
    flexWrap: 'wrap',
  },
  showMoreButton: {
    borderWidth: 1,
    borderColor: Colors.blue,
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  showMoreButtonText: {
    ...typography.caption,
    color: Colors.blue,
  },
  subjectTile: {
    margin: 4,
  },
})
