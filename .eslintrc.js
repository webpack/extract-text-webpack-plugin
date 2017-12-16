module.exports = {
  root: true,
  plugins: ['prettier'],
  extends: ['@webpack-contrib/eslint-config-webpack'],
  rules: {
    'prettier/prettier': [
      'error',
      { singleQuote: true, trailingComma: 'es5', arrowParens: 'always' },
    ],
    "prefer-destructuring": 1,
    "prefer-rest-params": 0,
    "class-methods-use-this": 1,
    "no-plusplus": 1,
    "consistent-return": 0,
    "no-param-reassign": 0
  },
};
