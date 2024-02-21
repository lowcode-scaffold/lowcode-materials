const main = require('../../../../dist/materials/snippets/formily/script/src/main');
const {
  context,
} = require('../../../../dist/materials/snippets/formily/script/src/context');

module.exports = {
  beforeCompile: (context) => {
    context.outputChannel.appendLine('compile formily start');
  },
  afterCompile: (context) => {
    context.outputChannel.appendLine('compile formily end');
  },
  test: (context) => {
    context.outputChannel.appendLine(Object.keys(context));
    context.outputChannel.appendLine(JSON.stringify(context.model));
    context.outputChannel.appendLine(context.params);
    return { ...context.model, name: '测试一下' };
  },
};
