import { StyleSheet } from "react-native"

export const BASE_FONT_SIZE = 16

// https://www.chainlift.io/liftkit#type
const typography = StyleSheet.create({
  display1: {
    fontWeight: '400',
    fontSize: 4.235 * BASE_FONT_SIZE, 
    lineHeight: 1.129 * BASE_FONT_SIZE, 
    letterSpacing: -0.022 * BASE_FONT_SIZE, 
  },
  display2: {
    fontWeight: '400',
    fontSize: 2.618 * BASE_FONT_SIZE, 
    lineHeight: 1.272 * BASE_FONT_SIZE, 
    letterSpacing: -0.022 * BASE_FONT_SIZE, 
  },
  titleA: {
    fontWeight: '400',
    fontSize: 2.058 * BASE_FONT_SIZE, 
    lineHeight: 1.272 * BASE_FONT_SIZE, 
    letterSpacing: -0.022 * BASE_FONT_SIZE, 
  },
  titleB: {
    fontWeight: '400',
    fontSize: 1.618 * BASE_FONT_SIZE, 
    lineHeight: 1.272 * BASE_FONT_SIZE, 
    letterSpacing: -0.02 * BASE_FONT_SIZE, 
  },
  titleC: {
    fontWeight: '400',
    fontSize: 1.272 * BASE_FONT_SIZE, 
    lineHeight: 1.272 * BASE_FONT_SIZE, 
    letterSpacing: -0.017 * BASE_FONT_SIZE, 
  },
  heading: {
    fontWeight: '600',
    fontSize: 1.129 * BASE_FONT_SIZE, 
    lineHeight: 1.272 * BASE_FONT_SIZE, 
    letterSpacing: -0.014 * BASE_FONT_SIZE, 
  },
  subheading: {
    fontWeight: '400',
    fontSize: 0.885 * BASE_FONT_SIZE, 
    lineHeight: 1.272 * BASE_FONT_SIZE, 
    letterSpacing: -0.007 * BASE_FONT_SIZE, 
  },
  body: {
    fontWeight: '400',
    fontSize: BASE_FONT_SIZE, 
    lineHeight: 1.618 * BASE_FONT_SIZE, 
    letterSpacing: -0.011 * BASE_FONT_SIZE, 
  },
  callout: {
    fontWeight: '400',
    fontSize: 0.943 * BASE_FONT_SIZE, 
    lineHeight: 1.272 * BASE_FONT_SIZE, 
    letterSpacing: -0.009 * BASE_FONT_SIZE, 
  },
  label: {
    fontWeight: '500',
    fontSize: 0.835 * BASE_FONT_SIZE, 
    lineHeight: 1.272 * BASE_FONT_SIZE, 
    letterSpacing: -0.004 * BASE_FONT_SIZE, 
  },
  caption: {
    fontWeight: '400',
    fontSize: 0.786 * BASE_FONT_SIZE, 
    lineHeight: 1.272 * BASE_FONT_SIZE, 
    letterSpacing: -0.007 * BASE_FONT_SIZE, 
  },
  overline: {
    fontWeight: '400',
    fontSize: 0.786 * BASE_FONT_SIZE, 
    lineHeight: 1.272 * BASE_FONT_SIZE, 
    letterSpacing: 0.0618 * BASE_FONT_SIZE, 
  },
});

export default typography
