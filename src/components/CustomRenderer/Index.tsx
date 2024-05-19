import React from 'react'
import { Text, TextStyle, View } from 'react-native'
import renderers from './renderers'

type ParsedElementType = keyof typeof renderers | 'text'

interface ParsedElement {
  type: ParsedElementType
  content: string
}

const parseStringToElements = (input: string): ParsedElement[] => {
  const elements: ParsedElement[] = []
  let currentText = ''
  let currentIndex = 0

  const pushText = () => {
    if (currentText) {
      elements.push({ type: 'text', content: currentText })
      currentText = ''
    }
  }

  while (currentIndex < input.length) {
    if (input[currentIndex] === '<') {
      pushText()
      const tagEndIndex = input.indexOf('>', currentIndex)
      if (tagEndIndex === -1) break

      const isClosingTag = input[currentIndex + 1] === '/'
      const tagName = isClosingTag
        ? input.slice(currentIndex + 2, tagEndIndex)
        : input.slice(currentIndex + 1, tagEndIndex)

      if (!isClosingTag) {
        const contentStartIndex = tagEndIndex + 1
        const contentEndIndex = input.indexOf(
          `</${tagName}>`,
          contentStartIndex,
        )
        if (contentEndIndex === -1) break

        const content = input.slice(contentStartIndex, contentEndIndex)
        elements.push({ type: tagName as ParsedElementType, content })

        currentIndex = contentEndIndex + tagName.length + 3 // Move past the closing tag
      } else {
        currentIndex = tagEndIndex + 1
      }
    } else if (input[currentIndex] === ' ') {
      currentText += input[currentIndex]
      pushText()
      currentIndex += 1
    } else {
      currentText += input[currentIndex]
      currentIndex += 1
    }
  }
  pushText()

  return elements
}

const renderElements = (
  elements: ParsedElement[],
  style?: TextStyle,
  keyPrefix = '',
): React.ReactNode[] => {
  return elements.map((element, index) => {
    const key = `${keyPrefix}-${index}`
    if (element.type === 'text') {
      return (
        <Text style={style} key={key}>
          {element.content}
        </Text>
      )
    } else if (renderers[element.type]) {
      const Renderer = renderers[element.type]
      return <Renderer style={style} key={key} text={element.content} />
    } else {
      return (
        <Text style={style} key={key}>
          {element.content}
        </Text>
      )
    }
  })
}

const CustomTagRenderer: React.FC<{
  children: React.ReactNode
  style?: TextStyle
}> = ({ children, style }) => {
  if (typeof children !== 'string') {
    console.error('CustomTagRenderer expects children to be a string')
    return null
  }

  const parsedElements = parseStringToElements(children)
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {renderElements(parsedElements, style)}
    </View>
  )
}

export default CustomTagRenderer
