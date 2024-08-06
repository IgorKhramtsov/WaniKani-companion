// https://docs.expo.dev/guides/using-eslint/

module.exports = {
  extends: [
    'expo',
    'prettier',
    'plugin:@tanstack/eslint-plugin-query/recommended',
  ],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'warn',
  },
}
