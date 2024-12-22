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
const main = require('../../../../dist/materials/blocks/现有模块中添加 antdv Descriptions 描述列表/script/src/main');
const {
  context,
} = require('../../../../dist/materials/blocks/现有模块中添加 antdv Descriptions 描述列表/script/src/context');

module.exports = {
  beforeCompile: (lowcodeContext) => {},
  afterCompile: (lowcodeContext) => {},
  complete: (lowcodeContext) => {
    context.lowcodeContext = lowcodeContext;
    main.handleComplete();
  },
  initFromOcrText: (lowcodeContext) => {
    let items = lowcodeContext.params
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .split('\n');
    items = items.map((s) => ({
      key: s.split(/:|：/g)[0],
      label: s.split(/:|：/g)[0],
    }));
    return { ...lowcodeContext.model, items };
  },
  askChatGPT: async (lowcodeContext) => {
    context.lowcodeContext = lowcodeContext;
    const res = await main.handleAskChatGPT();
    return res;
  },
  intFromClipboardImage: async (lowcodeContext) => {
    context.lowcodeContext = lowcodeContext;
    const res = await main.handleIntFromClipboardImage();
    return res;
  },

  OCR: async (lowcodeContext) => {
    context.lowcodeContext = lowcodeContext;
    const res = await main.handleOCR();
    return res;
  },
};
