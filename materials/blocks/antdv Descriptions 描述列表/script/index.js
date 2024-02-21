const main = require('../../../../dist/materials/blocks/antdv Descriptions 描述列表/script/src/main');
const {
  context,
} = require('../../../../dist/materials/blocks/antdv Descriptions 描述列表/script/src/context');

module.exports = {
  beforeCompile: (context) => {},
  afterCompile: (context) => {},
  initFromOcrText: (context) => {
    let items = context.params.split('\n');
    items = items.map((s) => ({
      key: s.split(/:|：/g)[0],
      label: s.split(/:|：/g)[0],
    }));
    return { ...context.model, items };
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
          content: `你是一个严谨的代码机器人，严格按照用户的要求处理问题`,
        },
        {
          role: 'user',
          content: `${JSON.stringify(
            context.model,
          )} 将这段 JSON 中 items 字段里的 key 字段的值翻译成英文，驼峰格式，返回翻译后的JSON，不要带其他无关的内容，并且返回的结果使用 JSON.parse 不会报错`,
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
