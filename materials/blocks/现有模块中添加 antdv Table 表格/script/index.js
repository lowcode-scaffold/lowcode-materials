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
const main = require('../../../../dist/materials/blocks/现有模块中添加 antdv Table 表格/script/src/main');
const {
  context,
} = require('../../../../dist/materials/blocks/现有模块中添加 antdv Table 表格/script/src/context');

module.exports = {
  beforeCompile: (lowcodeContext) => {},
  afterCompile: (lowcodeContext) => {},
  complete: (lowcodeContext) => {
    context.lowcodeContext = lowcodeContext;
    main.handleComplete();
  },
  intColumnsFromOcrText: (lowcodeContext) => {
    let columns = lowcodeContext.params
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .split('\n');
    columns = columns.map((s) => ({
      slot: false,
      title: s,
      dataIndex: s,
      key: s,
    }));
    lowcodeContext.outputChannel.appendLine(JSON.stringify(columns));
    return { ...lowcodeContext.model, columns };
  },
  askChatGPT: async (lowcodeContext) => {
    context.lowcodeContext = lowcodeContext;
    const res = await main.handleAskChatGPT();
    return res;
  },
  intColumnsFromClipboardImage: async (lowcodeContext) => {
    context.lowcodeContext = lowcodeContext;
    const res = await main.handleIntColumnsFromClipboardImage();
    return res;
  },
  insertPlaceholder: async (lowcodeContext) => {
    context.lowcodeContext = lowcodeContext;
    main.handleInsertPlaceholder();
    return context.model;
  },
  OCR: async (lowcodeContext) => {
    context.lowcodeContext = lowcodeContext;
    const res = await main.handleOCR();
    return res;
  },
};
