import fs from 'fs-extra';

export const clearCache = (path: string) => {
  getAllFiles(path).forEach((file) => {
    if (!file.includes('script/index.js')) {
      console.log(file);
      delete require.cache[require.resolve(file)];
    }
  });
};

// 递归获取文件夹下的所有文件
function getAllFiles(dirPath: string) {
  const files = fs.readdirSync(dirPath);

  let result: string[] = [];

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
