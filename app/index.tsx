import typography from "@/constants/typography";
import { Pressable, ScrollView, Text, View } from "react-native";
import { createStyleSheet, useStyles } from 'react-native-unistyles'


export default function Index() {
  const { styles } = useStyles(stylesheet)
  return (
    <ScrollView style={styles.scrollView} >
      <LessonsCard
        backgroundColor="#FF00AA"
        title={
          <View>
            <Text style={styles.text}>Today's</Text>
            <Text style={styles.textHeading}>Lessons</Text>
          </View>
        }
        message="We cooked up these lessons just for you."
        actions={
          <View>
            <Pressable style={styles.startButton}>
              <View style={styles.row}>
                <Text style={[styles.startButtonText, { color: '#FF00AA' }]}>Start Lessons</Text>
                <View style={{ width: 4 }} />
                <AntDesign name="right" size={typography.body.fontSize} color="#FF00AA" />
              </View>
            </Pressable>
            <View style={{ height: 16 }} />
            <Pressable style={styles.advancedButton}>
              <View style={styles.row}>
                <MaterialIcons name="smart-toy" size={typography.body.fontSize} color="white" />
                <View style={{ width: 4 }} />
                <Text style={styles.advancedButtonText}>Advanced</Text>
              </View>
            </Pressable>
          </View>
        }
      />
      <View style={{ height: 16 }} />
      <LessonsCard
        backgroundColor="#00AAFF"
        title={
          <View>
            <Text style={styles.textHeading}>Reviews</Text>
          </View>
        }
        message="Review these items to level them up!"
        actions={
          <View>
            <Pressable style={styles.startButton}>
              <View style={styles.row}>
                <Text style={[styles.startButtonText, { color: '#00AAFF' }]}>Start Reviews</Text>
                <View style={{ width: 4 }} />
                <AntDesign name="right" size={typography.body.fontSize} color="#00AAFF" />
              </View>
            </Pressable>
          </View>
        }
      />
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
  textHeading: {
    ...(typography.heading),
    color: "white",
  },
  button: {
    color: "transparent",
    backgroundColor: "white",
  },
  startButton: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 3,
    alignItems: "center",
  },
  startButtonText: {
    color: "#FF00AA",
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.fontSize * 1.1,
  },
  advancedButton: {
    backgroundColor: 'transparent',
    borderColor: 'white',
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 3,
    alignItems: "center",
  },
  advancedButtonText: {
    color: "white",
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.fontSize * 1.1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}))


import React from 'react';
import { AntDesign, MaterialIcons } from "@expo/vector-icons";

interface LessonsCardProps {
  backgroundColor: string;
  title: React.ReactNode,
  message: string,
  actions: React.ReactNode,
}

const LessonsCard: React.FC<LessonsCardProps> = ({ backgroundColor, title, message, actions }) => {
  const { styles } = useStyles(lessonsCardStyles)
  return (
    <View style={[styles.view, { backgroundColor }]} >
      {title}
      <View style={{ height: 16 }} />
      <Text style={styles.text}>{message}</Text>
      <View style={{ height: 8 }} />
      {actions}
    </View>
  );
};

const lessonsCardStyles = createStyleSheet(theme => ({
  view: {
    padding: 40,
  },
  text: {
    ...(typography.body),
    color: "white",
    lineHeight: typography.body.fontSize * 1.15,
  },
}))
