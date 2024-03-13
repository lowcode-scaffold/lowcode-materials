const main = require('../../../../dist/materials/snippets/测试脚本/script/src/main');
const {
  context,
} = require('../../../../dist/materials/snippets/测试脚本/script/src/context');

module.exports = {
  beforeCompile: (lowcodeContext) => {
    context.outputChannel.appendLine(Object.keys(lowcodeContext));
    context.vscode.window.showErrorMessage('12134');
    return { a: 'lowcode' };
  },
  afterCompile: (lowcodeContext) => {
    context.outputChannel.appendLine(Object.keys(lowcodeContext));
  },
  onSelect: async (lowcodeContext) => {
    await main.bootstrap();
  },
};
