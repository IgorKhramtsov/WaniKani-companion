import { ActivityIndicator, View } from "react-native"

export const FullPageLoading = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size='large' />
    </View>
  )
}
