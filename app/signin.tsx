import { Colors } from '@/src/constants/Colors'
import { appStyles } from '@/src/constants/styles'
import typography from '@/src/constants/typography'
import { useSession } from '@/src/context/authContext'
import { useApiKeyVerifier } from '@/src/hooks/useApiKeyVerifier'
import { AntDesign, FontAwesome } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  Keyboard,
  Linking,
  Pressable,
  Text,
  View,
} from 'react-native'
import { TextInput } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function SignIn() {
  const { styles } = useStyles(stylesheet)
  const { signIn } = useSession()
  const [input, setInput] = useState('')
  const [submitedKey, setSubmitedKey] = useState<string | undefined>(undefined)

  const { isLoading: verificationResultIsLoading, verificationResult } =
    useApiKeyVerifier(submitedKey)

  const hasInsufficientPermissions = useMemo(
    () =>
      verificationResult?.assignmentsStart === false ||
      verificationResult?.reviewsCreate === false ||
      verificationResult?.userUpdate === false,
    [verificationResult],
  )

  return (
    <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 36 }}>
        <View style={{ flex: 1 }}>
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: 240, alignItems: 'center' }}>
              <Image
                source={require('@/assets/images/wanikani-companion.png')}
                style={styles.image}
              />
            </View>
            <View style={{ height: 32 }} />
            {submitedKey === undefined && (
              <>
                <View>
                  <Text style={styles.apiTokenLabel}>API Token</Text>
                  <View style={{ height: 4 }} />
                  <TextInput
                    inputMode='text'
                    textContentType='none'
                    keyboardType='default'
                    autoComplete='off'
                    autoCorrect={false}
                    autoCapitalize='none'
                    placeholder='12345678-1234-1234-1234-123456789000'
                    importantForAutofill='no'
                    style={styles.input}
                    onChangeText={setInput}
                    value={input}
                  />
                </View>
                <View style={{ height: 12 }} />
                <Pressable
                  onPress={() =>
                    Linking.openURL(
                      'https://www.wanikani.com/settings/personal_access_tokens',
                    )
                  }>
                  <View style={appStyles.row}>
                    <Text style={styles.apiTokenLink}>Get API token</Text>
                    <View style={{ width: 8 }} />
                    <FontAwesome
                      name='external-link'
                      size={16}
                      color={Colors.blue}
                    />
                  </View>
                </Pressable>
                <View style={{ height: 36 }} />
                <Pressable
                  onPress={() => {
                    if (input === '') return

                    setSubmitedKey(input)
                  }}>
                  <View style={styles.button}>
                    <Text style={styles.buttonText}>Authenticate</Text>
                  </View>
                </Pressable>
              </>
            )}
            {submitedKey !== undefined && (
              <>
                <Text style={typography.titleC}>API key check</Text>
                <View style={{ height: 16 }} />
                <View>
                  <VerificationResult
                    value={verificationResult?.allDataRead}
                    name='all_data:read'
                  />
                  <VerificationResult
                    value={verificationResult?.assignmentsStart}
                    name='assignments:start'
                  />
                  <VerificationResult
                    value={verificationResult?.reviewsCreate}
                    name='reviews:create'
                  />
                  <VerificationResult
                    value={verificationResult?.userUpdate}
                    name='user:update'
                  />
                </View>
                <View style={{ height: 24 }} />
                {hasInsufficientPermissions && (
                  <>
                    <Text style={styles.hasInsufficientPermissionsText}>
                      WaniKani companion app requires all permissions to be
                      granted. Please create a new key with all permissions.
                    </Text>
                    <View style={{ height: 24 }} />
                  </>
                )}
                {hasInsufficientPermissions && (
                  <Pressable onPress={() => setSubmitedKey(undefined)}>
                    <View style={styles.button}>
                      <Text style={styles.buttonText}>Change API key</Text>
                    </View>
                  </Pressable>
                )}
                {!verificationResultIsLoading &&
                  !hasInsufficientPermissions && (
                    <Pressable
                      onPress={() => {
                        signIn(submitedKey)
                        router.replace('/')
                      }}>
                      <View style={styles.button}>
                        <Text style={styles.buttonText}>Continue</Text>
                      </View>
                    </Pressable>
                  )}
              </>
            )}
          </View>
          <Text style={styles.footerText}>
            This app is crafted by fellow learners and fans. It’s not officially
            linked to WaniKani, but we share the same passion for learning! Dive
            in, enjoy, and may your kanji journey be as exciting as ours. 🐙📚
          </Text>
        </View>
      </SafeAreaView>
    </Pressable>
  )
}

const VerificationResult = ({
  value,
  name,
}: {
  value: boolean | undefined
  name: string
}) => {
  const { styles } = useStyles(stylesheet)

  const statusComponent = useMemo(() => {
    switch (value) {
      case undefined:
        return <ActivityIndicator />
      case true:
        return (
          <AntDesign name='checksquare' size={18} color={Colors.correctGreen} />
        )
      case false:
        return (
          <AntDesign
            name='closesquare'
            size={18}
            color={Colors.destructiveRed}
          />
        )
    }
  }, [value])

  return (
    <View style={styles.verificationResult}>
      {statusComponent}
      <View style={{ width: 4 }} />
      <Text style={typography.body}>{name}</Text>
    </View>
  )
}

const stylesheet = createStyleSheet({
  image: {
    height: 64,
    resizeMode: 'contain',
  },
  apiTokenLink: {
    ...typography.body,
    color: Colors.blue,
    lineHeight: typography.body.fontSize * 1.1,
    fontWeight: '500',
  },
  input: {
    minWidth: 300,
    padding: 12,
    borderRadius: 5,
    backgroundColor: Colors.grayEA,
    // borderColor: Colors.gray,
    // borderBottomWidth: 1,
  },
  button: {
    paddingHorizontal: 50,
    backgroundColor: Colors.purple,
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    ...typography.body,
    fontWeight: '500',
    color: 'white',
  },
  apiTokenLabel: {
    ...typography.caption,
    color: Colors.gray55,
  },
  hasInsufficientPermissionsText: {
    ...typography.caption,
    width: '80%',
    textAlign: 'center',
    color: Colors.gray55,
  },
  verificationResult: {
    ...appStyles.row,
    marginBottom: 4,
  },
  footerText: {
    ...typography.caption,
    color: Colors.gray55,
    textAlign: 'center',
  },
})
