import { Colors } from "@/src/constants/Colors";
import typography from "@/src/constants/typography";
import { Pressable, ScrollView, Text, View } from "react-native";
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function Index() {
  const { styles } = useStyles(stylesheet)
  const glyph = 'AB'
  const name = 'Fifth Day'

  return (
    <ScrollView>
      <View style={[styles.glyphDisplayView, { backgroundColor: Colors.purple }]}>
        <Text style={styles.glyphText}>{glyph}</Text>
        <Text style={styles.glyphName}>{name}</Text>
      </View>

    </ScrollView>
  );
}

const stylesheet = createStyleSheet(theme => ({
  scrollView: {
    padding: 20,
  },
  text: {
    ...(typography.body),
    color: "white",
  },
  glyphText: {
    ...(typography.display1),
    color: 'white'
  },
  glyphName: {
    ...(typography.titleB),
    color: 'white',
    fontWeight: '300',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  glyphDisplayView: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center'
  },

}))

