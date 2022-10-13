const shell = require('shelljs');
const fs = require('fs');
const path = require('path');

shell.cp('-r', 'dist/src/*', 'dist/es');
shell.cp('-r', 'dist/src/*', 'dist');
shell.rm('-rf', 'dist/{src,tests,index.js,index.d.ts}');
shell.cp('package.json', 'LICENSE', 'README.md', 'README-CN.md', 'dist');

const packageInfo = require('../dist/package.json');
delete packageInfo.scripts;
delete packageInfo.devDependencies;
delete packageInfo['lint-staged'];
delete packageInfo['private'];
fs.writeFileSync(
  path.resolve(__dirname, '../dist/package.json'),
  JSON.stringify(packageInfo, null, '  '),
);
