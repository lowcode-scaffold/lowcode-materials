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
const main = require('../../../../dist/materials/blocks/antdv2 增删改查列表页/script/src/main');
const {
  context,
} = require('../../../../dist/materials/blocks/antdv2 增删改查列表页/script/src/context');

module.exports = {
  beforeCompile: (lowcodeContext) => {},
  afterCompile: (lowcodeContext) => {
    lowcodeContext.outputChannel.appendLine(__dirname);
    lowcodeContext.outputChannel.appendLine(__filename);
    lowcodeContext.outputChannel.appendLine(process.cwd());
    lowcodeContext.outputChannel.appendLine(
      JSON.stringify(lowcodeContext.model),
    );
    if (!lowcodeContext.model.includeModifyModal) {
      // lowcodeContext.libs.fsExtra.removeSync(
      //   path.join(
      //     path.join(lowcodeContext.env.tempWorkPath, 'src', 'ModifyModal'),
      //   ),
      // );
    }
  },
  complete: (lowcodeContext) => {
    context.lowcodeContext = lowcodeContext;
    try {
      main.handleComplete();
    } catch (ex) {}
  },
  initFiltersFromImage: async (lowcodeContext) => {
    context.lowcodeContext = lowcodeContext;
    const res = await main.handleInitFiltersFromImage();
    return res;
  },
  initFiltersFromText: (lowcodeContext) => {
    let filters = lowcodeContext.params
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .split('\n');
    filters = filters.map((item) => {
      const s = item.replace(/：|：/g, ':').split(':');
      return {
        component: (s[1] || '').indexOf('选择') > -1 ? 'select' : 'input',
        key: s[0].trim(),
        label: s[0].trim(),
        placeholder: s[1] || '',
      };
    });
    return {
      updateModelImmediately: false,
      onlyUpdateParams: false,
      params: '',
      model: { ...lowcodeContext.model, filters },
    };
  },
  initColumnsFromImage: async (lowcodeContext) => {
    context.lowcodeContext = lowcodeContext;
    const res = await main.handleInitColumnsFromImage();
    return res;
  },
  initColumnsFromText: (lowcodeContext) => {
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
    return {
      updateModelImmediately: false,
      onlyUpdateParams: false,
      params: '',
      model: { ...lowcodeContext.model, columns },
    };
  },
  askChatGPT: async (lowcodeContext) => {
    context.lowcodeContext = lowcodeContext;
    const res = await main.handleAskChatGPT();
    return res;
  },
  OCR: async (lowcodeContext) => {
    context.lowcodeContext = lowcodeContext;
    const res = await main.handleOCR();
    return res;
  },
};
