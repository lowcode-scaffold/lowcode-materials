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
const main = require('../../../../dist/materials/blocks/测试脚本/script/src/main');
const {
  context,
} = require('../../../../dist/materials/blocks/测试脚本/script/src/context');

module.exports = {
  beforeCompile: (context) => {
    const compileHandler =
      new main.CompileHandler3c5a281f3af548fda73cb864dd8f452b(context);
    compileHandler.log('compile start');
  },
  afterCompile: (context) => {
    const compileHandler =
      new main.CompileHandler3c5a281f3af548fda73cb864dd8f452b(context);
    compileHandler.log('compile end');
  },
  complete: (context) => {
    const compileHandler =
      new main.CompileHandler3c5a281f3af548fda73cb864dd8f452b(context);
    compileHandler.log('compile complete');
  },
  intFromOcrText: (context) => {
    const viewCallHandler =
      new main.ViewCallHandler3c5a281f3af548fda73cb864dd8f452b(context);
    viewCallHandler.log('call method intFromOcrText');
    viewCallHandler.showInformationMessage('lowcode');
    return viewCallHandler.intFromOcrText();
  },
  askChatGPT: (context) => {
    const viewCallHandler =
      new main.ViewCallHandler3c5a281f3af548fda73cb864dd8f452b(context);
    viewCallHandler.log('call method askChatGPT');
    return viewCallHandler.askChatGPT();
  },
};
