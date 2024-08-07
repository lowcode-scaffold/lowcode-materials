const main = require('../../../../dist/materials/blocks/现有模块中添加 antdv Form 垂直布局列表/script/src/main');
const {
  context,
} = require('../../../../dist/materials/blocks/现有模块中添加 antdv Form 垂直布局列表/script/src/context');

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

  OCR: async (lowcodeContext) => {
    context.lowcodeContext = lowcodeContext;
    const res = await main.handleOCR();
    return res;
  },
  runScript: async (lowcodeContext) => {
    context.lowcodeContext = lowcodeContext;
    const res = await main.handleRunScript();
    return res;
  },
};
