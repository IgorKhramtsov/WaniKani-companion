import { store } from "@/src/redux/store";
import { Stack } from "expo-router";
import { Image, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              title: "WaniKani",
              headerTitle: () => (
                <View>
                  <Image
                    source={require('@/assets/images/wanikani.png')}
                    style={styles.image}
                  />
                </View>
              )
            }}
          />
        </Stack>
      </GestureHandlerRootView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  image: {
    height: 32,
    resizeMode: 'contain'
  }
});
