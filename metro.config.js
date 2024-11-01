/* eslint-env node */
// Learn more https://docs.expo.io/guides/customizing-metro
const { getSentryExpoConfig } = require('@sentry/react-native/metro')

/** @type {import('expo/metro-config').MetroConfig} */
const config = getSentryExpoConfig(__dirname)

module.exports = (() => {
  const { transformer, resolver } = config

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  }
  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...resolver.sourceExts, 'svg', 'sql'],
  }

  return config
})()
