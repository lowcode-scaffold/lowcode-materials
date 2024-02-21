const main = require('../../../../dist/materials/snippets/快速创建区块/script/src/main');
const {
  context,
} = require('../../../../dist/materials/snippets/快速创建区块/script/src/context');

module.exports = {
  beforeCompile: (lowcodeContext) => {},
  afterCompile: (lowcodeContext) => {},
  onSelect: async (lowcodeContext) => {
    context.lowcodeContext = lowcodeContext;
    await main.bootstrap();
  },
};
