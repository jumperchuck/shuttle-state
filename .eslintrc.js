module.exports = {
  extends: ['prettier', 'plugin:prettier/recommended', 'plugin:react-hooks/recommended'],
  plugins: ['@typescript-eslint', 'react', 'prettier', 'react-hooks', 'jest'],
  parser: '@typescript-eslint/parser',
  rules: {
    curly: ['warn', 'multi-line', 'consistent'],
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-empty-pattern': 'warn',
    'no-duplicate-imports': 'error',
    'no-unused-labels': 'warn',
    'no-unused-vars': [
      'warn',
      {
        args: 'none',
        ignoreRestSiblings: true,
      },
    ],
    '@typescript-eslint/no-unused-vars': 'error',
  },
  settings: {},
  overrides: [
    {
      files: ['src'],
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  ],
};
