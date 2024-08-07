const main = require('../../../../dist/materials/snippets/通过 TS 类型做字段映射/script/src/main');
const {
  context,
} = require('../../../../dist/materials/snippets/通过 TS 类型做字段映射/script/src/context');

module.exports = {
  beforeCompile: (lowcodeContext) => {},
  afterCompile: (lowcodeContext) => {},
  onSelect: async (lowcodeContext) => {
    context.lowcodeContext = lowcodeContext;
    await main.bootstrap();
  },
};
