require('ts-node').register({
  transpileOnly: false,
  emit: false,
  compilerHost: false, // 和 emit 一起设置为 true，会在 .ts-node 文件夹输出编译后的代码
  cwd: __dirname, // 要输出编译后代码必须配置，否则会报错 EROFS: read-only file system, mkdir '/.ts-node'。不输出也要配置不然会出现各种奇奇怪怪的报错
});
const path = require('path');
// 清除缓存，保证每次修改代码后实时生效
// delete require.cache[require.resolve(path.join(__dirname, 'main.ts'))];
const main = require('./src/main.ts');
const context = require('./src/context.ts');

module.exports = {
  beforeCompile: (lowcodeContext) => {
    lowcodeContext.outputChannel.appendLine(
      'compile 通过脚本启动一个 nest api 服务 start',
    );
  },
  afterCompile: (lowcodeContext) => {
    lowcodeContext.outputChannel.appendLine(
      'compile 通过脚本启动一个 nest api 服务 end',
    );
  },
  startNestApiServer: async (lowcodeContext) => {
    lowcodeContext.outputChannel.appendLine(Object.keys(lowcodeContext));
    lowcodeContext.outputChannel.appendLine(
      JSON.stringify(lowcodeContext.model),
    );
    lowcodeContext.outputChannel.appendLine(lowcodeContext.params);
    context.lowcodeContext = lowcodeContext;
    await main.bootstrap();
    return { ...lowcodeContext.model };
  },
};
