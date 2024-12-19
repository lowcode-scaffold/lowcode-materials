const path = require('path');
const OSS = require('ali-oss');
const tar = require('tar');
const fs = require('fs-extra');

const tempPath = path.join(__dirname, '.lowcode', 'dist');
const file = path.join(__dirname, '.lowcode', 'download.tar.gz');

fs.copySync(
  path.join(__dirname, 'dist', 'uTools'),
  path.join(tempPath, 'uTools'),
);

fs.copySync(
  path.join(__dirname, 'dist', 'share/uTools/webviewBaseControllerBundle.js'),
  path.join(tempPath, 'share/uTools/webviewBaseControllerBundle.js'),
);

const dirNameArray = fs.readdirSync(path.join(tempPath, 'uTools'));
// eslint-disable-next-line no-restricted-syntax
for (const dirName of dirNameArray) {
  const scriptPath = path.join(tempPath, 'uTools', dirName, 'script');
  fs.removeSync(path.join(scriptPath, 'index.js'));
  const files = fs.readdirSync(path.join(scriptPath, 'src'));
  files.forEach((f) => {
    if (f !== 'mainBundle.js') {
      fs.removeSync(path.join(path.join(scriptPath, 'src'), f));
    }
  });
}

const upload = async () => {
  await tar.create(
    {
      gzip: true,
      file,
      cwd: path.join(__dirname, '.lowcode'),
    },
    ['dist'],
  );

  if (process.env.bucket) {
    const store = new OSS({
      region: 'oss-cn-beijing',
      accessKeyId: process.env.accessKeyId,
      accessKeySecret: process.env.accessKeySecret,
      bucket: process.env.bucket,
    });
    store.put('download-free.tar.gz', file).then((result) => {
      fs.removeSync(path.join(__dirname, '.lowcode'));
      console.log(result.url);
    });
  }
};

upload();
