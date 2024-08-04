/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import tinycolor from 'tinycolor2'

const tintColorLight = '#0a7ea4'
const tintColorDark = '#fff'

const pink = '#FF00AA'
const purple = '#9F01ED'
const blue = '#00AAFF'
const gray55 = '#555555'

const getDarker = (baseColor: string, strength: number) =>
  tinycolor(baseColor).darken(strength).toString()
const getLighter = (baseColor: string, strength: number) =>
  tinycolor(baseColor).lighten(strength).toString()
export const Colors = {
  black: '#000',
  white: '#fff',
  pink,
  blue,
  purple,
  gray55,
  grayC5: '#C5C5C7', // ios settings icon
  gray88: '#88888C', // ios settings value
  grayEA: '#EAEAEA',
  grayDA: '#DADADA',
  correctGreen: '#88CC01',
  green: '#5BA733',
  quizGreen: '#34D399',
  incorrectRed: '#DC3545',
  destructiveRed: '#FF3B30',
  /*
   * Can be used for borders
   */
  grayDark: '#ccc',
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
  getDarker,
  getLighter,
  getBottomBorderColor: (baseColor: string) => getDarker(baseColor, 12),
}
