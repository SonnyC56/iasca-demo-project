import type { UserConfig } from '@commitlint/types'

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Allow trailers such as Co-Authored-By without tripping line-length checks.
    'body-max-line-length': [0],
    'footer-max-line-length': [0],
  },
}

export default config
