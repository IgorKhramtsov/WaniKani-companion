import { Colors } from '@/src/constants/Colors'
import { StyleSheet, Text, TextStyle, View } from 'react-native'

const getGenericRenderer = (color: string) => {
  const Component = ({
    text,
    metaTags,
    style,
  }: {
    text: string
    metaTags: string[]
    style?: TextStyle
  }) => {
    const colorsStyle = {
      backgroundColor: color,
      borderBottomColor: Colors.getBottomBorderColor(color),
    }

    return (
      <View style={[styles.container, colorsStyle]}>
        <Text
          style={[style, styles.text]}
          accessibilityLanguage={metaTags.includes('ja') ? 'ja' : undefined}>
          {text}
        </Text>
      </View>
    )
  }
  Component.displayName = `GenericRenderer(${color})`
  return Component
}

const renderers = {
  vocabulary: getGenericRenderer(Colors.purple),
  kanji: getGenericRenderer(Colors.pink),
  radical: getGenericRenderer(Colors.blue),
  reading: getGenericRenderer(Colors.gray55),
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.purple,
    borderRadius: 3,
    paddingHorizontal: 4,
    borderBottomWidth: 2.5,
    borderBottomColor: Colors.getBottomBorderColor(Colors.purple),
  },
  text: {
    color: 'white',
    fontWeight: 500,
  },
})

export default renderers
