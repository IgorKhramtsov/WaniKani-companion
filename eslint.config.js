const { FlatCompat } = require('@eslint/eslintrc')
const expoConfig = require('eslint-config-expo/flat')
const prettierPlugin = require('eslint-plugin-prettier')

const compat = new FlatCompat({ baseDirectory: __dirname })

module.exports = [
  ...expoConfig,
  ...compat.extends(
    'plugin:@tanstack/eslint-plugin-query/recommended',
    'prettier',
  ),
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'warn',
    },
  },
]
