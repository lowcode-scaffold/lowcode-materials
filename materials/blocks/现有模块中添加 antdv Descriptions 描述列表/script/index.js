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
    let items = lowcodeContext.params.split('\n');
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
};
