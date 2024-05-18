import { StyleSheet } from "react-native"

export const appStyles = StyleSheet.create({
  barrier: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black', // semi-transparent background
    zIndex: 9999, // ensure it's on top
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})
