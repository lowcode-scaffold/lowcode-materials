const main = require('../../../../dist/materials/snippets/设置配置信息/script/src/main');
const {
  context,
} = require('../../../../dist/materials/snippets/设置配置信息/script/src/context');

module.exports = {
  beforeCompile: (lowcodeContext) => {},
  afterCompile: (lowcodeContext) => {},
  onSelect: async (lowcodeContext) => {
    context.lowcodeContext = lowcodeContext;
    await main.bootstrap();
  },
};
