const path = require('path');
const fs = require('fs-extra');
/**
 * @description
 * @param {string} dirPath
 * @return {string[]}
 */
function getAllFiles(dirPath) {
  const files = fs.readdirSync(dirPath);

  let result = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const file of files) {
    const filePath = `${dirPath}/${file}`;
    // eslint-disable-next-line no-await-in-loop
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      result = result.concat(getAllFiles(filePath));
    } else {
      result.push(filePath);
    }
  }

  return result;
}

const devContent = `
require('ts-node').register({
  transpileOnly: true,
  typeCheck: false,
  emit: false,
  compilerHost: false, // 和 emit 一起设置为 true，会在 .ts-node 文件夹输出编译后的代码
  cwd: __dirname, // 要输出编译后代码必须配置，否则会报错 EROFS: read-only file system, mkdir '/.ts-node'。不输出也要配置不然会出现各种奇奇怪怪的报错
});
// 清除缓存，保证每次修改代码后实时生效，否则要重新打开 vscode
const { clearCache } = require('../../../../share/clearCache.ts');

clearCache(__dirname); // 调试的时候才打开，不然会很慢
const main = require('./src/main.ts');
const { context } = require('./src/context.ts');

`;

const mode = process.argv[2] || 'prod';

fs.removeSync(path.join(__dirname, 'dist'));

getAllFiles(path.join(__dirname, 'materials'))
  .filter((s) => s.includes('script/index.js') && !s.includes('.ejs'))
  .forEach((file) => {
    const materialName = file
      .replace(/\\/g, '/')
      .replace(`${__dirname.replace(/\\/g, '/')}/materials/`, '')
      .replace('/script/index.js', '');
    const prodContent = `
const path = require('path');
const moduleAlias = require('module-alias');

function splitStringByLastKeyword(inputString, keyword) {
  const lastIndex = inputString.lastIndexOf(keyword);

  if (lastIndex === -1) {
    return [inputString, ''];
  }

  const part1 = inputString.slice(0, lastIndex);
  const part2 = inputString.slice(lastIndex + keyword.length);

  return [part1, part2];
}

moduleAlias.addAlias(
  '@share',
  path.join(splitStringByLastKeyword(__dirname, 'materials')[0], 'dist/share'),
);
const main = require('../../../../dist/materials/${materialName}/script/src/main');
const {
  context,
} = require('../../../../dist/materials/${materialName}/script/src/context');

`;
    const content = fs.readFileSync(file).toString();
    const exportContent = `module.exports${content.split('module.exports')[1]}`;
    if (mode === 'prod') {
      fs.writeFileSync(file, prodContent.trimStart() + exportContent);
    } else {
      fs.writeFileSync(file, devContent.trimStart() + exportContent);
    }
  });
