const main = require('../../../../dist/materials/blocks/vant 表单/script/src/main');
const {
  context,
} = require('../../../../dist/materials/blocks/vant 表单/script/src/context');

module.exports = {
  beforeCompile: (context) => {},
  afterCompile: (context) => {
    context.outputChannel.appendLine(__dirname);
    context.outputChannel.appendLine(__filename);
    context.outputChannel.appendLine(process.cwd());
    context.outputChannel.appendLine(JSON.stringify(context.model));
  },
  askChatGPT: async (context) => {
    const statusBarItem = context.vscode.window.createStatusBarItem(
      context.vscode.StatusBarAlignment.Left,
    );
    statusBarItem.text = '$(sync~spin) Ask ChatGPT...';
    statusBarItem.show();
    const res = await context.createChatCompletion({
      messages: [
        {
          role: 'system',
          content: `你是一个严谨的代码机器人，严格按照输入的要求处理问题`,
        },
        {
          role: 'user',
          content: `${JSON.stringify(
            context.model,
          )} 将这段 json formItems 字段中的 key 字段的值翻译为英文，使用驼峰语法，label、placeholder
					保留中文。
					返回翻译后的JSON，不要带其他无关的内容，并且返回的结果使用 JSON.parse 不会报错`,
        },
      ],
      handleChunk: (data) => {
        // context.outputChannel.append(data.text || '')
      },
    });
    statusBarItem.hide();
    statusBarItem.dispose();
    context.outputChannel.appendLine(res);
    return { ...context.model, ...JSON.parse(res) };
  },
};
