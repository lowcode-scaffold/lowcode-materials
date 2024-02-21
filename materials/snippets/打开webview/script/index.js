const main = require('../../../../dist/materials/snippets/打开webview/script/src/main');
const {
  context,
} = require('../../../../dist/materials/snippets/打开webview/script/src/context');

module.exports = {
  beforeCompile: (lowcodeContext) => {},
  afterCompile: (lowcodeContext) => {},
  onSelect: async (lowcodeContext) => {
    context.lowcodeContext = lowcodeContext;
    await main.bootstrap();
  },
  testScript: (lowcodeContext) => {
    context.lowcodeContext = lowcodeContext;
    return main.testScript();
  },
};
