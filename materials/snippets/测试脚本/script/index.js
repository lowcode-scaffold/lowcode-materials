const path = require('path');
const moduleAlias = require('module-alias');

moduleAlias.addAlias(
  '@share',
  path.join(__dirname.split('materials')[0], 'dist/share'),
);
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
  onActivate: () => {
    main.onActivate();
  },
};
