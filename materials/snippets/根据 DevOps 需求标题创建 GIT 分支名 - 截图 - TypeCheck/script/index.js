const path = require('path');
const moduleAlias = require('module-alias');

moduleAlias.addAlias(
  '@share',
  path.join(__dirname.split('materials')[0], 'dist/share'),
);
const main = require('../../../../dist/materials/snippets/根据 DevOps 需求标题创建 GIT 分支名 - 截图 - TypeCheck/script/src/main');
const {
  context,
} = require('../../../../dist/materials/snippets/根据 DevOps 需求标题创建 GIT 分支名 - 截图 - TypeCheck/script/src/context');

module.exports = {
  beforeCompile: (lowcodeContext) => {},
  afterCompile: (lowcodeContext) => {},
  onSelect: async (lowcodeContext) => {
    context.lowcodeContext = lowcodeContext;
    await main.bootstrap();
  },
};
