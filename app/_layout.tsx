import { Stack } from "expo-router";
import { Image, StyleSheet, View } from "react-native";

export default function RootLayout() {
  return (
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
  );
}

const styles = StyleSheet.create({
  image: {
    height: 32,
    resizeMode: 'contain'
  }
});
