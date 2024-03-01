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

getAllFiles(path.join(__dirname, 'dist', 'uTools'))
  .filter((s) => s.includes('index.js'))
  .forEach((file) => {
    const mainFilePath = file
      .replace(/\\/g, '/')
      .replace('index.js', 'src/main');
    const content = fs.readFileSync(file).toString();
    const newContent = content
      .replace(
        'Object.defineProperty(exports, "__esModule", { value: true });',
        '',
      )
      .replace('// @ts-ignore', '')
      .replace(
        'const main_1 = require("./src/main");',
        `const main_1 = require("${mainFilePath}");`,
      );
    fs.writeFileSync(file, newContent);
  });
