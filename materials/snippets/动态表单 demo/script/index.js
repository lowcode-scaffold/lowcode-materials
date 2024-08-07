const main = require('../../../../dist/materials/snippets/动态表单 demo/script/src/main');
const {
  context,
} = require('../../../../dist/materials/snippets/动态表单 demo/script/src/context');

module.exports = {
  beforeCompile: (lowcodeContext) => {},
  afterCompile: (lowcodeContext) => {},
  onSelect: async (lowcodeContext) => {
    context.lowcodeContext = lowcodeContext;
    await main.bootstrap();
  },
};
