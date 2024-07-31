import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { includeIgnoreFile } from '@eslint/compat'
// import js from '@eslint/js'
// import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const gitignorePath = path.resolve(__dirname, '.gitignore')


// const compat = new FlatCompat({
//   baseDirectory: __dirname,
//   recommendedConfig: js.configs.recommended,
//   allConfig: js.configs.all,
// })

export default [
  /*...compat.extends('standard', 'plugin:require-path-exists/recommended'),*/
  includeIgnoreFile(gitignorePath),
  {
    rules: {
      'comma-dangle': ['error', 'always-multiline'],
      // 'no-mixed-operators': ['off'],
      // 'no-return-assign': ['off'],
      curly: ['error', 'all'],
      'brace-style': ['error', '1tbs'],
    },
  },
]
