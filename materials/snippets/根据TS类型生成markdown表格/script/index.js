const path = require('path');
const moduleAlias = require('module-alias');

moduleAlias.addAlias(
  '@share',
  path.join(__dirname.split('materials')[0], 'dist/share'),
);
const main = require('../../../../dist/materials/snippets/根据TS类型生成markdown表格/script/src/main');
const {
  context,
} = require('../../../../dist/materials/snippets/根据TS类型生成markdown表格/script/src/context');

module.exports = {
  beforeCompile: () => {},
  afterCompile: () => {
    context.outputChannel.appendLine('compile 根据TS类型生成markdown表格 end');
  },
};
