const { build } = require('esbuild');

const sharedConfig = {
  entryPoints: ['./dist/uTools/翻译为驼峰格式/script/src/main.js'],
  bundle: true,
  minify: false,
  // only needed if you have dependencies
  external: ['electron'],
};

build({
  ...sharedConfig,
  platform: 'node',
  format: 'cjs',
  outfile: 'dist/index.js',
});
