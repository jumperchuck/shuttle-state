import path from 'path';
import fs from 'fs';
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import esbuild from 'rollup-plugin-esbuild';
import { sizeSnapshot } from 'rollup-plugin-size-snapshot';

const babelConfig = require('./babel.config');
const extensions = ['.js', '.ts', '.tsx'];
const external = ['react', 'shuttle-state'];
const sizePath = path.resolve('./size-snapshot');

fs.mkdirSync(sizePath);

babelConfig.presets.forEach((item) => {
  if (Array.isArray(item) && item[0] === '@babel/preset-env') {
    item[1] = {
      ...item[1],
      modules: false,
    };
  }
});

function createDeclaration(input, outDir) {
  return {
    external,
    input: input,
    output: {
      dir: outDir,
    },
    plugins: [typescript({ declaration: true, outDir: outDir })],
  };
}

function createCommonJS(input, output) {
  const dir = output.split('/')[1];
  const snapshotPath = `${sizePath}/${dir}.size-snapshot.json`;
  return {
    external,
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
      sizeSnapshot({ snapshotPath }),
    ],
  };
}

function createES(input, output) {
  const dir = output.split('/')[1];
  const snapshotPath = `${sizePath}/${dir}.size-snapshot.json`;
  return {
    external,
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
      sizeSnapshot({ snapshotPath }),
    ],
  };
}

function createConfig(input, output) {
  const [prefix, suffix] = output.split('.');
  return [
    createCommonJS(`src/${input}`, `dist/${output}`),
    createES(`src/${input}`, `dist/${prefix}.es.${suffix}`),
  ];
}

export default function () {
  return [
    createDeclaration('src/index.ts', 'dist'),
    ...createConfig('core/index.ts', 'core/index.js'),
    ...createConfig('context/index.ts', 'context/index.js'),
    ...createConfig('compare/index.ts', 'compare/index.js'),
    ...createConfig('middleware/index.ts', 'middleware/index.js'),
  ];
}
