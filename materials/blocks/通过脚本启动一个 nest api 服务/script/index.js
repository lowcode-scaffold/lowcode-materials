require('ts-node').register({
  transpileOnly: false,
  emit: false,
  compilerHost: false, // 和 emit 一起设置为 true，会在 .ts-node 文件夹输出编译后的代码
  cwd: __dirname, // 要输出编译后代码必须配置，否则会报错 EROFS: read-only file system, mkdir '/.ts-node'。不输出也要配置不然会出现各种奇奇怪怪的报错
});

module.exports = {
  beforeCompile: (context) => {
    context.outputChannel.appendLine(
      'compile 通过脚本启动一个 nest api 服务 start',
    );
  },
  afterCompile: (context) => {
    context.outputChannel.appendLine(
      'compile 通过脚本启动一个 nest api 服务 end',
    );
  },
  test: (context) => {
    context.outputChannel.appendLine(Object.keys(context));
    context.outputChannel.appendLine(JSON.stringify(context.model));
    context.outputChannel.appendLine(context.params);
    return { ...context.model, name: '测试一下' };
  },
};
