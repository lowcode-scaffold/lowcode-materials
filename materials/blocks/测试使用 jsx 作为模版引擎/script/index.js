const main = require('../../../../dist/materials/blocks/测试使用 jsx 作为模版引擎/script/src/main');
const {
  context,
} = require('../../../../dist/materials/blocks/测试使用 jsx 作为模版引擎/script/src/context');

module.exports = {
  beforeCompile: (lowcodeContext) => {},
  afterCompile: async (lowcodeContext) => {
    context.lowcodeContext = lowcodeContext;
    try {
      await main.handleAfterCompile();
    } catch (ex) {
      console.log(ex);
    }
  },
  complete: async (lowcodeContext) => {
    context.lowcodeContext = lowcodeContext;
    try {
      await main.handleComplete();
    } catch (ex) {
      console.log(ex);
    }
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
    lowcodeContext.outputChannel.appendLine(JSON.stringify(filters));
    return { ...lowcodeContext.model, filters };
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
    lowcodeContext.outputChannel.appendLine(JSON.stringify(columns));
    return { ...lowcodeContext.model, columns };
  },
  askChatGPT: async (lowcodeContext) => {
    context.lowcodeContext = lowcodeContext;
    const res = await main.handleAskChatGPT();
    return res;
  },
};
