import { getConfigForJs } from 'eslint-config-wdzeng'

export default getConfigForJs(
  {
    'unicorn/prefer-top-level-await': 'off', // transpiled cjs does not support top-level await
    'preserve-caught-error': 'off' // this hurts when bundling
  },
  {
    projectRoot: import.meta.dirname,
    ignores: ['dist/**'],
    ecmaVersion: 2022,
    node: true,
    browser: false,
    vitest: false
  }
)
