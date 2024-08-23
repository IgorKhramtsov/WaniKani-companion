// NOTE: AI generated

import React from 'react'
import { Text, TextStyle, View } from 'react-native'
import renderers from './renderers'

// The list of tags to be treated as meta tags
const jaTag = 'ja'
const META_TAGS = [jaTag]

type ParsedElementType = keyof typeof renderers | 'text'

interface ParsedElement {
  type: ParsedElementType
  content: string
  metaTags: string[]
}

const parseStringToElements = (input: string): ParsedElement[] => {
  const elements: ParsedElement[] = []
  let currentText = ''
  let currentIndex = 0
  let currentMetaTags: string[] = []

  const pushText = () => {
    if (currentText) {
      elements.push({
        type: 'text',
        content: currentText,
        metaTags: [...currentMetaTags],
      })
      currentText = ''
    }
  }

  while (currentIndex < input.length) {
    if (input[currentIndex] === '<') {
      const tagEndIndex = input.indexOf('>', currentIndex)
      if (tagEndIndex === -1) break

      const isClosingTag = input[currentIndex + 1] === '/'
      const tagName = isClosingTag
        ? input.slice(currentIndex + 2, tagEndIndex)
        : input.slice(currentIndex + 1, tagEndIndex)

      if (META_TAGS.includes(tagName)) {
        if (!isClosingTag) {
          currentMetaTags.push(tagName)
        } else {
          currentMetaTags = currentMetaTags.filter(tag => tag !== tagName)
        }
        currentIndex = tagEndIndex + 1
        continue
      }

      pushText()

      if (!isClosingTag) {
        const contentStartIndex = tagEndIndex + 1
        const contentEndIndex = input.indexOf(
          `</${tagName}>`,
          contentStartIndex,
        )
        if (contentEndIndex === -1) break

        const content = input.slice(contentStartIndex, contentEndIndex)
        elements.push({
          type: tagName as ParsedElementType,
          content,
          metaTags: [...currentMetaTags],
        })
        currentIndex = contentEndIndex + tagName.length + 3 // Move past the closing tag
      } else {
        currentIndex = tagEndIndex + 1
      }
    } else if (input[currentIndex] === ' ') {
      currentText += input[currentIndex]
      pushText()
      currentIndex += 1
    } else if (input[currentIndex] === '\r') {
      if (input[currentIndex + 1] === '\n') {
        currentText += '\n'
        pushText()
        currentIndex += 2
      } else {
        currentText += input[currentIndex]
        pushText()
        currentIndex += 1
      }
    } else if (input[currentIndex] === '\n') {
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
      if (element.content === '\r' || element.content === '\n') {
        // make a new line
        return <View style={{ width: '100%' }} key={key} />
      }
      return (
        <Text
          style={style}
          key={key}
          accessibilityLanguage={
            element.metaTags.includes(jaTag) ? 'ja' : undefined
          }>
          {element.content}
        </Text>
      )
    } else if (renderers[element.type]) {
      const Renderer = renderers[element.type]
      return (
        <Renderer
          style={style}
          key={key}
          text={element.content}
          {...(element.metaTags && { metaTags: element.metaTags })}
        />
      )
    } else {
      return (
        <Text
          style={style}
          key={key}
          accessibilityLanguage={
            element.metaTags.includes(jaTag) ? 'ja' : undefined
          }>
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
