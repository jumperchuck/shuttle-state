import path from 'path';
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import esbuild from 'rollup-plugin-esbuild';

const babelConfig = require('./babel.config');
const extensions = ['.js', '.ts', '.tsx'];

babelConfig.presets.forEach((item) => {
  if (Array.isArray(item) && item[0] === '@babel/preset-env') {
    item[1] = {
      ...item[1],
      modules: false,
    };
  }
});

function createDeclaration() {
  return {
    external: ['react'],
    input: 'src/index.ts',
    output: {
      dir: 'dist',
    },
    plugins: [typescript({ declaration: true, outDir: 'dist' })],
  };
}

function createCommonJS(input, output) {
  return {
    external: ['react'],
    input,
    output: {
      file: output,
      format: 'cjs',
      exports: 'named',
    },
    plugins: [
      resolve({ extensions }),
      babel({
        ...babelConfig,
        extensions,
        comments: false,
        babelHelpers: 'bundled',
      }),
    ],
  };
}

function createES(input, output) {
  return {
    external: ['react'],
    input: input,
    output: {
      file: output,
      format: 'es',
    },
    plugins: [
      resolve({ extensions }),
      esbuild({
        minify: false,
        tsconfig: path.resolve('./tsconfig.json'),
      }),
    ],
  };
}

function createConfig(input, output) {
  return [
    createCommonJS(`src/${input}`, `dist/${output}`),
    createES(`src/${input}`, `dist/es/${output}`),
  ];
}

const baseConfigs = createConfig('index.ts', 'index.js');

const extraConfigs = [
  { input: 'compare.ts', output: 'compare.js' },
  { input: 'context.ts', output: 'context.js' },
  { input: 'createApi.ts', output: 'createApi.js' },
  { input: 'createContainer.ts', output: 'createContainer.js' },
  { input: 'createState.ts', output: 'createState.js' },
].flatMap(({ input, output }) => createConfig(input, output));

export default [createDeclaration(), ...baseConfigs, ...extraConfigs];
