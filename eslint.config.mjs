import { getConfigForJs } from 'eslint-config-wdzeng'

export default getConfigForJs(
  {
    'unicorn/no-process-exit': 'off',
    'unicorn/prefer-top-level-await': 'off' // transpiled cjs does not support top-level await
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
