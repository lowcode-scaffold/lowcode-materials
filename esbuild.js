const { build } = require('esbuild');

const sharedConfig = {
  entryPoints: ['./dist/uTools/abcdef/script/index.js'],
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
