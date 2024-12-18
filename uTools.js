const path = require('path');
const fs = require('fs-extra');
const { build } = require('esbuild');
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
  .forEach(async (file) => {
    const mainFilePath = file
      .replace(/\\/g, '/')
      .replace('index.js', 'src/main');
    const mainBundleFilePath = file
      .replace(/\\/g, '/')
      .replace('index.js', 'src/mainBundle');
    const content = fs.readFileSync(file).toString();
    const indexContent = content
      .replace(
        'Object.defineProperty(exports, "__esModule", { value: true });',
        `const mainFilePath = "${mainFilePath}";`,
      )
      .replace('// @ts-ignore', '')
      .replace(
        'const main_1 = require("./src/main");',
        `const main_1 = require(mainFilePath);`,
      )
      .replace(
        '(0, main_1.bootstrap)()',
        `(0, main_1.bootstrap)(mainFilePath)`,
      );
    const indexBundleContent = content
      .replace(
        'Object.defineProperty(exports, "__esModule", { value: true });',
        `const mainFilePath = "${mainBundleFilePath}";`,
      )
      .replace('// @ts-ignore', '')
      .replace(
        'const main_1 = require("./src/main");',
        `const main_1 = require(mainFilePath);`,
      )
      .replace(
        '(0, main_1.bootstrap)()',
        `(0, main_1.bootstrap)(mainFilePath)`,
      );
    fs.writeFileSync(file, indexContent);
    const indexBundleFile = file
      .replace(/\\/g, '/')
      .replace('index.js', 'indexBundle.js');
    fs.writeFileSync(indexBundleFile, indexBundleContent);
    await build({
      entryPoints: [`${mainFilePath}.js`],
      bundle: true,
      minify: true,
      // only needed if you have dependencies
      external: ['electron', 'typescript-json-schema'],
      platform: 'node',
      format: 'cjs',
      outfile: mainFilePath.replace('/main', '/mainBundle.js'),
    });
    const conetnt = fs.readFileSync(`${mainFilePath}.js`).toString();
    fs.writeFileSync(
      `${mainFilePath}.js`,
      `const moduleAlias = require('module-alias');
moduleAlias.addAlias('@share', '${path
        .join(__dirname, 'dist', 'share')
        .replace(/\\/g, '/')}');
				${conetnt}`,
    );
    build({
      entryPoints: [`${mainFilePath}.js`],
      bundle: false,
      minify: false,
      // only needed if you have dependencies
      // external: ['electron'],
      platform: 'node',
      format: 'cjs',
      outfile: `${mainFilePath}.js`,
      allowOverwrite: true,
    });
  });

// bundle other files
['share/uTools/webviewBaseController.js'].forEach(async (file) => {
  const entryFile = path.join(__dirname, 'dist', file);
  build({
    entryPoints: [entryFile],
    bundle: true,
    minify: true,
    // only needed if you have dependencies
    external: ['electron'],
    platform: 'node',
    format: 'cjs',
    outfile: entryFile.replace('.js', 'Bundle.js'),
    allowOverwrite: true,
  });
});

// 复制物料文件

const copyDir = () => {
  const dirPath = path.join(__dirname, 'uTools');
  const distDirPath = path.join(__dirname, 'dist', 'uTools');
  const dirNameArry = fs.readdirSync(dirPath);
  // eslint-disable-next-line no-restricted-syntax
  for (const dirName of dirNameArry) {
    const childDirPath = path.join(dirPath, dirName);
    const stats = fs.statSync(childDirPath);
    if (stats.isDirectory()) {
      const copyDirArray = fs.readdirSync(childDirPath);
      // eslint-disable-next-line no-restricted-syntax
      for (const copyDirName of copyDirArray) {
        if (copyDirName !== 'script') {
          const copyDirPath = path.join(childDirPath, copyDirName);
          fs.copySync(
            copyDirPath,
            path.join(distDirPath, dirName, copyDirName),
          );
        }
      }
    }
  }
};
copyDir();
