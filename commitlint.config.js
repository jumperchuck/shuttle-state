module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'perf',
        'style',
        'refactor',
        'test',
        'chore',
        'revert',
        'merge',
      ],
    ],
    'subject-case': [0, 'never'],
    'subject-full-stop': [0, 'never'],
  },
};
