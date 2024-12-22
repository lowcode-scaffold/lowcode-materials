const path = require('path');
const moduleAlias = require('module-alias');

function splitStringByLastKeyword(inputString, keyword) {
  const lastIndex = inputString.lastIndexOf(keyword);

  if (lastIndex === -1) {
    return [inputString, ''];
  }

  const part1 = inputString.slice(0, lastIndex);
  const part2 = inputString.slice(lastIndex + keyword.length);

  return [part1, part2];
}

moduleAlias.addAlias(
  '@share',
  path.join(splitStringByLastKeyword(__dirname, 'materials')[0], 'dist/share'),
);
const main = require('../../../../dist/materials/snippets/amis/script/src/main');
const {
  context,
} = require('../../../../dist/materials/snippets/amis/script/src/context');

module.exports = {
  beforeCompile: (context) => {
    context.outputChannel.appendLine('compile amis start');
  },
  afterCompile: (context) => {
    context.outputChannel.appendLine('compile amis end');
  },
  test: (context) => {
    context.outputChannel.appendLine(Object.keys(context));
    context.outputChannel.appendLine(JSON.stringify(context.model));
    context.outputChannel.appendLine(context.params);
    return { ...context.model, name: '测试一下' };
  },
};
