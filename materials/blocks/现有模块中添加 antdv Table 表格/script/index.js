require('ts-node').register({
  transpileOnly: true,
  typeCheck: false,
  emit: false,
  compilerHost: false, // 和 emit 一起设置为 true，会在 .ts-node 文件夹输出编译后的代码
  cwd: __dirname, // 要输出编译后代码必须配置，否则会报错 EROFS: read-only file system, mkdir '/.ts-node'。不输出也要配置不然会出现各种奇奇怪怪的报错
});
const { clearCache } = require('../../../../share/clearCache.ts');
// 清除缓存，保证每次修改代码后实时生效，否则要重新打开 vscode
clearCache(__dirname); // 调试的时候才打开，不然会很慢
const main = require('./src/main.ts');
const { context } = require('./src/context.ts');

module.exports = {
  beforeCompile: (lowcodeContext) => {},
  afterCompile: (lowcodeContext) => {},
  complete: (lowcodeContext) => {
    context.lowcodeContext = lowcodeContext;
    main.handleComplete();
  },
  intColumnsFromOcrText: (lowcodeContext) => {
    let columns = lowcodeContext.params.split('\n');
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
    const statusBarItem = lowcodeContext.vscode.window.createStatusBarItem(
      lowcodeContext.vscode.StatusBarAlignment.Left,
    );
    statusBarItem.text = '$(sync~spin) Ask ChatGPT...';
    statusBarItem.show();
    const res = await lowcodeContext.createChatCompletion({
      messages: [
        {
          role: 'system',
          content: `你是一个严谨的代码机器人，严格按照输入的要求处理问题`,
        },
        {
          role: 'user',
          content: `${JSON.stringify(
            lowcodeContext.model,
          )} 将这段 json 中，columns 字段中的 key、dataIndex 字段的值翻译为英文，使用驼峰语法。
					返回翻译后的JSON，不要带其他无关的内容，并且返回的结果使用 JSON.parse 不会报错`,
        },
      ],
      handleChunk: (data) => {
        // lowcodeContext.outputChannel.append(data.text || '')
      },
    });
    statusBarItem.hide();
    statusBarItem.dispose();
    lowcodeContext.outputChannel.appendLine(res);
    return { ...lowcodeContext.model, ...JSON.parse(res) };
  },
};
