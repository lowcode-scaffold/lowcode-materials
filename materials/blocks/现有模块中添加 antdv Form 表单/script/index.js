const main = require('../../../../dist/materials/blocks/现有模块中添加 antdv Form 表单/script/src/main');
const {
  context,
} = require('../../../../dist/materials/blocks/现有模块中添加 antdv Form 表单/script/src/context');

module.exports = {
  beforeCompile: (lowcodeContext) => {},
  afterCompile: (lowcodeContext) => {},
  complete: (lowcodeContext) => {
    context.lowcodeContext = lowcodeContext;
    main.handleComplete();
  },
  initFromOcrText: (lowcodeContext) => {
    let formItems = lowcodeContext.params
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .split('\n');
    formItems = formItems.map((s) => ({
      key: s.split(/:|：/g)[0],
      label: s.split(/:|：/g)[0],
      placeholder: s.split(/:|：/g)[1] || '',
    }));
    return { ...lowcodeContext.model, formItems };
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
