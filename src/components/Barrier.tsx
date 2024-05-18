import { PropsWithChildren } from "react";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { appStyles } from "../constants/styles";
import { createStyleSheet, useStyles } from "react-native-unistyles";

type Props = PropsWithChildren<{
  strength?: number
}>

export const Barrier = ({ children, strength = 0.2 }: Props) => {
  const { styles } = useStyles(stylesheet)
  const backgroundColor = `rgba(0, 0, 0, ${strength})`
  return (
    <Animated.View style={[styles.container, {backgroundColor: backgroundColor}]} entering={FadeIn} exiting={FadeOut} >
      {children}
    </Animated.View>
  );
};

const stylesheet = createStyleSheet({
  container: appStyles.barrier,
});
