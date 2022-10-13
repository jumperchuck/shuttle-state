import path from 'path';
import fs from 'fs';
import shell from 'shelljs';
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import esbuild from 'rollup-plugin-esbuild';
import { sizeSnapshot } from 'rollup-plugin-size-snapshot';

const babelConfig = require('./babel.config');
const extensions = ['.js', '.ts', '.tsx'];
const external = ['react', 'shuttle-state'];

shell.rm('-rf', 'dist');
shell.rm('-rf', 'size-snapshot');
fs.mkdirSync('size-snapshot');

babelConfig.presets.find(
  (item) => Array.isArray(item) && item[0] === '@babel/preset-env',
)[1].modules = false;

function createDeclarationConfig(input, outDir) {
  return {
    external,
    input,
    output: {
      dir: outDir,
    },
    plugins: [typescript({ declaration: true, outDir: outDir })],
  };
}

function createCJSConfig(input, output) {
  const dir = output.split('/')[1];
  const snapshotPath = `size-snapshot/${dir}.size-snapshot.json`;
  return {
    external,
    input,
    output: {
      file: `${output}.js`,
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

function createESMConfig(input, output) {
  const dir = output.split('/')[1];
  const snapshotPath = `size-snapshot/${dir}.size-snapshot.json`;
  return {
    external,
    input,
    output: {
      file: `${output}.es.js`,
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
  const [prefix] = output.split('.');
  return [createCJSConfig(input, prefix), createESMConfig(input, prefix)];
}

export default function () {
  return [
    createDeclarationConfig('src/index.ts', 'dist'),
    ...createConfig('src/core/index.ts', 'dist/core/index.js'),
    ...createConfig('src/context/index.ts', 'dist/context/index.js'),
    ...createConfig('src/compare/index.ts', 'dist/compare/index.js'),
    ...createConfig('src/middleware/index.ts', 'dist/middleware/index.js'),
  ];
}
