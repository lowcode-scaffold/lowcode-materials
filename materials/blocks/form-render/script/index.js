const path = require('path');
const moduleAlias = require('module-alias');

moduleAlias.addAlias(
  '@share',
  path.join(__dirname.split('materials')[0], 'dist/share'),
);
const main = require('../../../../dist/materials/blocks/form-render/script/src/main');
const {
  context,
} = require('../../../../dist/materials/blocks/form-render/script/src/context');

module.exports = {
  beforeCompile: (context) => {},
  afterCompile: (context) => {
    context.outputChannel.appendLine('compile form-render end');
  },
  test: (context) => {
    context.outputChannel.appendLine(Object.keys(context));
    context.outputChannel.appendLine(JSON.stringify(context.model));
    context.outputChannel.appendLine(context.params);
    return { ...context.model, name: '测试一下' };
  },
};
