require('ts-node').register({
  transpileOnly: true,
  typeCheck: false,
  emit: false,
  compilerHost: false, // 和 emit 一起设置为 true，会在 .ts-node 文件夹输出编译后的代码
  cwd: __dirname, // 要输出编译后代码必须配置，否则会报错 EROFS: read-only file system, mkdir '/.ts-node'。不输出也要配置不然会出现各种奇奇怪怪的报错
});
// 清除缓存，保证每次修改代码后实时生效，否则要重新打开 vscode
const { clearCache } = require('../../../../share/clearCache.ts');

// clearCache(__dirname); // 调试的时候才打开，不然会很慢
const main = require('./src/main.ts');
const { context } = require('./src/context.ts');

module.exports = {
  beforeCompile: (lowcodeContext) => {
    lowcodeContext.outputChannel.appendLine(
      'compile start nest api srver start',
    );
  },
  afterCompile: (lowcodeContext) => {
    lowcodeContext.outputChannel.appendLine('compile start nest api srver end');
  },
  test: (lowcodeContext) => {
    lowcodeContext.outputChannel.appendLine(Object.keys(lowcodeContext));
    lowcodeContext.outputChannel.appendLine(
      JSON.stringify(lowcodeContext.model),
    );
    lowcodeContext.outputChannel.appendLine(lowcodeContext.params);
    return { ...lowcodeContext.model, name: '测试一下' };
  },
  onSelect: async (lowcodeContext) => {
    context.lowcodeContext = lowcodeContext;
    await main.bootstrap();
  },
};
