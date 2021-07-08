const shelljs = require('shelljs');
const fs = require('fs');
const path = require('path');

shelljs.cp('-r', 'dist/src/*', 'dist/es');
shelljs.mv('dist/src/*', 'dist');
shelljs.rm('-rf', 'dist/{src,tests}');
shelljs.cp('package.json', 'LICENSE', 'README.md', 'README-CN.md', 'dist');

const packageInfo = require('../dist/package.json');
delete packageInfo.scripts;
delete packageInfo.devDependencies;
delete packageInfo['lint-staged'];
fs.writeFileSync(
  path.resolve(__dirname, '../dist/package.json'),
  JSON.stringify(packageInfo, null, '\t'),
);
