// AI

// TODO: Fix flickering on first frame (when we measure the height)
import React, { useState, useRef, useEffect } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'

interface CollapsibleProps {
  children: React.ReactNode
  disabled?: boolean
  buttonBuilder?: (expanded: boolean) => React.ReactNode
  previewHeight: number
  expandButtonText?: string
  collapseButtonText?: string
}

const Collapsible: React.FC<CollapsibleProps> = ({
  children,
  disabled = false,
  previewHeight,
  expandButtonText = 'Show More',
  collapseButtonText = 'Show Less',
  buttonBuilder,
}) => {
  const [expanded, setExpanded] = useState(false)
  const [collapsible, setCollapsible] = useState(false)
  const contentRef = useRef<View>(null)

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.measure((x, y, width, height) => {
        setCollapsible(height > previewHeight)
      })
    }
  }, [previewHeight])

  const toggleExpanded = () => {
    setExpanded(!expanded)
  }

  if (disabled) return <>{children}</>

  return (
    <View>
      <View
        ref={contentRef}
        style={[
          styles.content,
          !expanded &&
            collapsible && { height: previewHeight, overflow: 'hidden' },
        ]}>
        {children}
      </View>
      {collapsible && (
        <Pressable onPress={toggleExpanded}>
          {buttonBuilder ? (
            buttonBuilder(expanded)
          ) : (
            <View style={styles.button}>
              <Text style={styles.buttonText}>
                {expanded ? collapseButtonText : expandButtonText}
              </Text>
            </View>
          )}
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#333',
    fontWeight: 'bold',
  },
})

export default Collapsible
