const path = require('path');
const moduleAlias = require('module-alias');

moduleAlias.addAlias(
  '@share',
  path.join(__dirname.split('materials')[0], 'dist/share'),
);
const main = require('../../../../dist/materials/snippets/start nest api server/script/src/main');
const {
  context,
} = require('../../../../dist/materials/snippets/start nest api server/script/src/context');

module.exports = {
  beforeCompile: (lowcodeContext) => {
    lowcodeContext.outputChannel.appendLine(
      'compile start nest api srver start',
    );
  },
  afterCompile: (lowcodeContext) => {
    lowcodeContext.outputChannel.appendLine('compile start nest api srver end');
  },
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
