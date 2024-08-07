const vscode = require('vscode');
const gemini = require('../dist/share/LLM/gemini');
const geminiProxy = require('../dist/share/LLM/geminiProxy');
const openai = require('../dist/share/LLM/openai');
const share = require('../dist/share/utils/shareData');

const GeminiKey = 'lowcode.GeminiKey';
const OpenaiKey = 'lowcode.OpenaiKey';

module.exports = {
  /**
   * @description 替换 lowcode 插件内部的 ChatGPT 请求，修改后需要重启对应项目 vscode
   * @param {({
   *   messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
   *   handleChunk?: (data: { text?: string; }) => void;
   *   lowcodeContext: { env: { extensionContext:  any }};
   * })} options
   * @returns {Promise<string>}
   */
  createChatCompletion: async (options) => {
    const context = options.lowcodeContext.env.extensionContext;
    // await context.secrets.delete(GeminiKey); // 需要更新 API KEY 的时候打开
    // let apiKey = await context.secrets.get(GeminiKey);
    // if (!apiKey) {
    //   vscode.window.showWarningMessage(
    //     'Enter your API KEY to save it securely.',
    //   );
    //   apiKey = await setApiKey(context, GeminiKey);
    //   if (!apiKey) {
    //     if (options.handleChunk) {
    //       options.handleChunk({ text: 'Please enter your api key' });
    //     }
    //     return 'Please enter your api key';
    //   }
    // }
    // const res = await gemini.createChatCompletion({
    //   messages: options.messages,
    //   model: 'gemini-pro',
    //   apiKey,
    //   handleChunk(data) {
    //     if (options.handleChunk) {
    //       options.handleChunk(data);
    //     }
    //   },
    //   proxyUrl: 'http://127.0.0.1:7890',
    // });
    // return res;
    // const res = await geminiProxy.createChatCompletion({
    //   messages: options.messages,
    //   model: 'gemini-pro',
    //   maxTokens: '4096',
    //   handleChunk(data) {
    //     if (options.handleChunk) {
    //       options.handleChunk(data);
    //     }
    //   },
    // });
    // return res;

    // await context.secrets.delete(OpenaiKey); // 需要更新 API KEY 的时候打开
    // let apiKey = await context.secrets.get(OpenaiKey);
    // if (!apiKey) {
    //   vscode.window.showWarningMessage(
    //     'Enter your API KEY to save it securely.',
    //   );
    //   apiKey = await setApiKey(context, OpenaiKey);
    //   if (!apiKey) {
    //     if (options.handleChunk) {
    //       options.handleChunk({ text: 'Please enter your api key' });
    //     }
    //     return 'Please enter your api key';
    //   }
    // }
    const config = share.oneAPIConfig() || {};
    const res = await openai.createChatCompletion({
      messages: options.messages,
      hostname: config.hostname,
      model: config.model,
      apiKey: config.apiKey,
      notHttps: config.notHttps,
      apiPath: config.apiPath,
      port: config.port,
      handleChunk(data) {
        if (options.handleChunk) {
          options.handleChunk(data);
        }
      },
    });
    return res;
  },
};
