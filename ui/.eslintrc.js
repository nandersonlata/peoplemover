module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
        '@typescript-eslint',
        'react',
        'jest',
        'react-hooks',
        'react-redux',
    ],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'fbjs',
        'plugin:react-redux/recommended',
    ],
    rules: {
        'react/jsx-uses-react': 'error',
        'react/jsx-uses-vars': 'error',
        'react/prop-types': 0,
        'max-len': 0,
        'jsx-a11y/no-static-element-interactions': 0,
        'indent': [2, 4],
        '@typescript-eslint/no-use-before-define': [0, 'nofunc'],
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 0,
        'react-redux/mapDispatchToProps-prefer-shorthand': 0,
        '@typescript-eslint/ban-ts-ignore': 0,
    },
    settings: {
        react: {
            version: 'detect',
        }
    },
};