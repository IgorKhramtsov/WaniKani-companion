import { Colors } from '@/src/constants/Colors'
import { appStyles } from '@/src/constants/styles'
import typography from '@/src/constants/typography'
import { FontAwesome } from '@expo/vector-icons'
import { Keyboard, Pressable, View } from 'react-native'
import { FlatList, TextInput } from 'react-native-gesture-handler'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { useTabPress } from '@/src/hooks/useTabPress'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSubjectSearch } from '@/src/hooks/useSubjectSearch'
import { LoadingIndicator } from '@/src/components/LoadingIndicator'
import { SubjectTile } from '@/src/components/SubjectTile'

const Index = () => {
  const { styles } = useStyles(stylesheet)
  const scrollViewRef = React.useRef<FlatList>(null)
  const searchInputRef = React.useRef<TextInput>(null)
  const [scrollOffset, setScrollOffset] = React.useState(0)
  const [query, setQuery] = React.useState('')

  const { subjects, isLoading } = useSubjectSearch(query)
  useTabPress(() => {
    if (scrollOffset > 0) {
      scrollViewRef.current?.scrollToOffset({ offset: 0 })
    } else {
      searchInputRef.current?.focus()
    }
  })

  return (
    <SafeAreaView edges={['top']}>
      <Pressable
        style={{ height: '100%' }}
        disabled={true}
        onPress={Keyboard.dismiss}
        accessible={false}>
        <View style={styles.pageContainer}>
          <View style={{ flex: 1 }}>
            <LoadingIndicator loading={isLoading}>
              <FlatList
                ref={scrollViewRef}
                data={subjects}
                onScroll={e => setScrollOffset(e.nativeEvent.contentOffset.y)}
                ListHeaderComponent={
                  <View style={styles.search}>
                    <FontAwesome
                      name='search'
                      size={16}
                      color={Colors.gray88}
                    />
                    <View style={{ width: 8 }} />
                    <TextInput
                      ref={searchInputRef}
                      textAlignVertical='center'
                      multiline={false}
                      style={styles.searchInput}
                      placeholder='Search'
                      autoCorrect={false}
                      autoComplete='off'
                      onChangeText={setQuery}
                    />
                  </View>
                }
                contentContainerStyle={{
                  marginHorizontal: 30,
                  paddingBottom: 16,
                }}
                renderItem={({ item }) => (
                  <SubjectTile
                    key={item.id}
                    variant='extended'
                    subject={item}
                  />
                )}
                ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
              />
            </LoadingIndicator>
          </View>
        </View>
      </Pressable>
    </SafeAreaView>
  )
}
export default Index

const stylesheet = createStyleSheet({
  pageContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  search: {
    ...appStyles.row,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    paddingLeft: 8,
  },
  searchInput: {
    ...typography.body,
    lineHeight: typography.body.fontSize * 1.2,
    flex: 1,
    padding: 8,
    margin: 0,
  },
})
