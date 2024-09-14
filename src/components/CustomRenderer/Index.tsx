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

/*
 * @internal
 * Exposed for tests only.
 */
export const parseStringToElements = (input: string): ParsedElement[] => {
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

  const parseTag = (): [string, number] => {
    const tagEndIndex = input.indexOf('>', currentIndex)
    if (tagEndIndex === -1) return ['', input.length]

    const isClosingTag = input[currentIndex + 1] === '/'
    const tagContent = isClosingTag
      ? input.slice(currentIndex + 2, tagEndIndex)
      : input.slice(currentIndex + 1, tagEndIndex)

    return [tagContent, tagEndIndex]
  }

  while (currentIndex < input.length) {
    if (input[currentIndex] === '<') {
      const [tagContent, tagEndIndex] = parseTag()
      if (!tagContent) break

      const isClosingTag = input[currentIndex + 1] === '/'

      if (META_TAGS.includes(tagContent)) {
        pushText()
        if (!isClosingTag) {
          currentMetaTags.push(tagContent)
        } else {
          currentMetaTags = currentMetaTags.filter(tag => tag !== tagContent)
        }
        currentIndex = tagEndIndex + 1
        continue
      }

      pushText()

      if (!isClosingTag) {
        const contentStartIndex = tagEndIndex + 1
        const contentEndIndex = input.indexOf(
          `</${tagContent}>`,
          contentStartIndex,
        )
        if (contentEndIndex === -1) break

        const content = input.slice(contentStartIndex, contentEndIndex)
        const nestedElements = parseStringToElements(content)

        if (nestedElements.length === 1 && nestedElements[0].type === 'text') {
          elements.push({
            type: tagContent as ParsedElementType,
            content: nestedElements[0].content,
            metaTags: [...currentMetaTags, ...nestedElements[0].metaTags],
          })
        } else {
          elements.push({
            type: tagContent as ParsedElementType,
            content: content,
            metaTags: [...currentMetaTags],
          })
        }

        currentIndex = contentEndIndex + tagContent.length + 3 // Move past the closing tag
      } else {
        currentIndex = tagEndIndex + 1
      }
    } else if (input[currentIndex] === ' ') {
      currentText += input[currentIndex]
      pushText()
      currentIndex += 1
    } else if (input[currentIndex] === '\r') {
      if (input[currentIndex + 1] === '\n') {
        pushText()
        currentText += '\n'
        pushText()
        currentIndex += 2
      } else {
        pushText()
        currentText += input[currentIndex]
        pushText()
        currentIndex += 1
      }
    } else if (input[currentIndex] === '\n') {
      pushText()
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
