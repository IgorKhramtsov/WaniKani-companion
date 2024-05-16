import { ScrollView, Text, View } from "react-native";
import { createStyleSheet, useStyles } from 'react-native-unistyles'


export default function Index() {
  const { styles } = useStyles(stylesheet)
  return (
    <ScrollView
      style={styles.scrollView}
    // p={20}
    >
      <View
        style={styles.view}
      // bg={"#FF00AA"}
      // p={40}
      >
        <Text style={styles.text}>Today's</Text>
        <Text style={styles.text}>Lessons</Text>
        <Text style={styles.text}>We cooked up these lessons just for you.</Text>
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Edit app/index.tsx to edit this screen.</Text>
      </View>
    </ScrollView>
  );
}

const stylesheet = createStyleSheet(theme => ({
  scrollView: {
    padding: 20,
  },
  view: {
    backgroundColor: "#FF00AA",
  },
  text: {
    color: "white",
  }
}))
