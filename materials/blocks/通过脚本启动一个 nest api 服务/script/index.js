const path = require('path');
const moduleAlias = require('module-alias');

moduleAlias.addAlias(
  '@share',
  path.join(__dirname.split('materials')[0], 'dist/share'),
);
const main = require('../../../../dist/materials/blocks/通过脚本启动一个 nest api 服务/script/src/main');
const {
  context,
} = require('../../../../dist/materials/blocks/通过脚本启动一个 nest api 服务/script/src/context');

module.exports = {
  beforeCompile: (lowcodeContext) => {},
  afterCompile: (lowcodeContext) => {},
  startNestApiServer: async (lowcodeContext) => {
    context.lowcodeContext = lowcodeContext;
    await main.bootstrap();
    return { ...lowcodeContext.model };
  },
};
