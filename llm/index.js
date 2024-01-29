const vscode = require('vscode');
const gemini = require('../dist/share/LLM/gemini');

const API_KEY = 'lowcode.GeminiKey';

module.exports = {
  /**
   * @description
   * @param {({
   *   messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
   *   handleChunk?: (data: { text?: string; hasMore: boolean }) => void;
   *   lowcodeContext: { env: { extensionContext:  any }};
   * })} options
   * @returns {Promise<string>}
   */
  createChatCompletion: async (options) => {
    const context = options.lowcodeContext.env.extensionContext;
    // await context.secrets.delete(API_KEY); // 需要更新 API KEY 的时候打开
    let apiKey = await context.secrets.get(API_KEY);

    if (!apiKey) {
      vscode.window.showWarningMessage(
        'Enter your API KEY to save it securely.',
      );
      apiKey = await setApiKey(context);
      if (!apiKey) {
        if (options.handleChunk) {
          options.handleChunk({ text: 'Please enter your api key' });
        }
        return 'Please enter your api key';
      }
    }
    const res = await gemini.createChatCompletion({
      messages: options.messages,
      model: 'gemini-pro',
      apiKey,
      handleChunk(data) {
        if (options.handleChunk) {
          options.handleChunk(data);
        }
      },
      proxyUrl: 'http://127.0.0.1:7890',
    });
    return res;
  },
};

async function setApiKey(context) {
  const apiKey = await vscode.window.showInputBox({
    title: 'Enter your API KEY',
    password: true,
    placeHolder: '**************************************',
    ignoreFocusOut: true,
  });

  if (!apiKey) {
    vscode.window.showWarningMessage('Empty value');
    return;
  }

  await context.secrets.store(API_KEY, apiKey);
  return apiKey;
}
