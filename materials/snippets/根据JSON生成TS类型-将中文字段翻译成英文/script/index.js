const path = require('path');
const moduleAlias = require('module-alias');

moduleAlias.addAlias(
  '@share',
  path.join(__dirname.split('materials')[0], 'dist/share'),
);
const main = require('../../../../dist/materials/snippets/根据JSON生成TS类型-将中文字段翻译成英文/script/src/main');
const {
  context,
} = require('../../../../dist/materials/snippets/根据JSON生成TS类型-将中文字段翻译成英文/script/src/context');

module.exports = {
  beforeCompile: (lowcodeContext) => {},
  afterCompile: (lowcodeContext) => {},
  onSelect: async (lowcodeContext) => {
    context.lowcodeContext = lowcodeContext;
    await main.bootstrap();
  },
};
