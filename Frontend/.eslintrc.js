module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'standard',
    'plugin:react/recommended'
  ],
  overrides: [
    {
      env: {
        node: true
      },
      files: [
        '.eslintrc.{js,cjs}'
      ],
      parserOptions: {
        sourceType: 'script'
      }
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: [
    'react'
  ],
  rules: {
    quotes: ['error', 'single'],
    // we use 2 spaces to indent our code
    indent: ['error', 2],
    // comprobacion de signos
    eqeqeq: 'off',
    // configuracion variables no usadas
    'no-unused-vars': 'warn',
    // we want to avoid extraneous spaces
    'no-multi-spaces': ['warn'],
    // no scope react js
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/no-deprecated': 'off',
    camelcase: 'off'
  }
}
