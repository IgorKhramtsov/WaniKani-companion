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

export const Colors = {
  pink,
  blue,
  purple,
  getBottomBorderColor: (baseColor: string) =>
    tinycolor(baseColor).darken(12).toString(),
  gray: '#EAEAEA',
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
}
