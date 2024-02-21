const main = require('../../../../dist/materials/snippets/axios-request-api-外挂脚本/script/src/main');
const {
  context,
} = require('../../../../dist/materials/snippets/axios-request-api-外挂脚本/script/src/context');

module.exports = {
  beforeCompile: (lowcodeContext) => {},
  afterCompile: (lowcodeContext) => {},
  test: (lowcodeContext) => {
    lowcodeContext.outputChannel.appendLine(Object.keys(lowcodeContext));
    lowcodeContext.outputChannel.appendLine(
      JSON.stringify(lowcodeContext.model),
    );
    lowcodeContext.outputChannel.appendLine(lowcodeContext.params);
    return { ...lowcodeContext.model, name: '测试一下' };
  },
  onSelect: async (lowcodeContext) => {
    context.lowcodeContext = lowcodeContext;
    await main.bootstrap();
  },
};
