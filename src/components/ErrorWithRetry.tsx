import { PropsWithChildren } from 'react'
import { Barrier } from './Barrier'
import { Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import typography from '../constants/typography'
import { Ionicons } from '@expo/vector-icons'

type Props = PropsWithChildren<{
  error?: string
  onRetry: () => void
}>

export const ErrorWithRetry = ({ children, error, onRetry }: Props) => {
  const { styles } = useStyles(stylesheet)

  return (
    <View>
      {error !== undefined && (
        <Barrier strength={0.5}>
          <Text style={styles.retryText}>{error}</Text>
          <View style={{ height: 16 }} />
          <Pressable style={styles.button} onPress={onRetry}>
            <Ionicons name='refresh' size={24} color='#fff' />
            <Text style={styles.buttonText}>Retry</Text>
          </Pressable>
        </Barrier>
      )}
      {children}
    </View>
  )
}

const stylesheet = createStyleSheet({
  retryText: {
    ...typography.body,
    color: 'white',
  },
  button: {
    alignItems: 'center',
  },
  buttonText: {
    ...typography.body,
    color: 'white',
  },
})
