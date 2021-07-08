module.exports = {
  ignore: ['./node_modules'],
  presets: [
    [
      '@babel/preset-env',
      {
        loose: true,
        modules: false,
        targets: { node: 'current' },
      },
    ],
  ],
  plugins: ['@babel/plugin-transform-typescript'],
};
