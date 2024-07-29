import { Colors } from '@/src/constants/Colors'
import { appStyles } from '@/src/constants/styles'
import typography from '@/src/constants/typography'
import { FontAwesome } from '@expo/vector-icons'
import { Keyboard, Pressable, Text, View } from 'react-native'
import { TextInput } from 'react-native-gesture-handler'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { useTabPress } from '@/src/hooks/useTabPress'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const Index = () => {
  const { styles } = useStyles(stylesheet)
  const searchInputRef = React.useRef<TextInput>(null)
  const [searchInput, setSearchInput] = React.useState('')

  useTabPress(() => {
    searchInputRef.current?.focus()
  })

  return (
    <SafeAreaView>
      <Pressable
        style={{ height: '100%' }}
        disabled={false}
        onPress={Keyboard.dismiss}
        accessible={false}>
        <View style={styles.pageContainer}>
          <View style={styles.search}>
            <FontAwesome name='search' size={16} color={Colors.gray88} />
            <View style={{ width: 8 }} />
            <TextInput
              ref={searchInputRef}
              textAlignVertical='center'
              multiline={false}
              style={styles.searchInput}
              placeholder='Search'
              autoCorrect={false}
              autoComplete='off'
              onChangeText={setSearchInput}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text>Search for kanji</Text>
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
    marginHorizontal: 30,
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
