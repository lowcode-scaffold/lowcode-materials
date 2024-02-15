import * as vscode from 'vscode';
import { CompileContext } from 'lowcode-context';
import { showWebView } from '../WebView';
import { emitter } from '../utils/emitter';
import * as gemini from './gemini';
import * as geminiProxy from './geminiProxy';
import * as openai from './openai';

const API_KEY = 'lowcode.GeminiKey';

type Message = (
  | {
      role: 'system';
      content: string;
    }
  | {
      role: 'user';
      content:
        | string
        | (
            | {
                type: 'image_url';
                image_url: { url: string };
              }
            | { type: 'text'; text: string }
          )[];
    }
)[];

export const createChatCompletion = async (options: {
  messages: Message;
  handleChunk?: (data: { text?: string }) => void;
  lowcodeContext: CompileContext;
  llm?: string;
}) => {
  if (options.llm === 'gemini') {
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
      model: options.messages.some(
        (s) =>
          Array.isArray(s.content) &&
          s.content.some((c) => c.type === 'image_url'),
      )
        ? 'gemini-pro-vision'
        : 'gemini-pro',
      apiKey,
      handleChunk(data) {
        if (options.handleChunk) {
          options.handleChunk(data);
        }
      },
      proxyUrl: 'http://127.0.0.1:7890',
    });
    return res;
  }
  if (options.llm === 'geminiProxy') {
    const res = await geminiProxy.createChatCompletion({
      messages: options.messages,
      model: options.messages.some(
        (s) =>
          Array.isArray(s.content) &&
          s.content.some((c) => c.type === 'image_url'),
      )
        ? 'gemini-pro-vision'
        : 'gemini-pro',
      maxTokens: 4096,
      handleChunk(data) {
        if (options.handleChunk) {
          options.handleChunk(data);
        }
      },
    });
    return res;
  }
  const res = await openai.createChatCompletion({
    messages: options.messages,
    handleChunk(data) {
      if (options.handleChunk) {
        options.handleChunk(data);
      }
    },
  });
  return res;
};

export const createChatCompletionForScript = (options: {
  messages: Message;
  handleChunk?: (data: { text?: string }) => void;
  lowcodeContext: CompileContext;
  llm?: string;
  showWebview?: boolean;
}) => {
  if (!options.showWebview) {
    return createChatCompletion({
      messages: options.messages,
      handleChunk: options.handleChunk,
      lowcodeContext: options.lowcodeContext,
      llm: options.llm,
    });
  }
  // 打开 webview，使用 emitter 监听结果，把结果回传给 script
  showWebView({
    key: 'main',
    task: {
      task: 'askLLM',
      data: options.messages.map((m) => m.content).join('\n'),
    },
  });
  return new Promise<string>((resolve) => {
    emitter.on('chatGPTChunck', (data) => {
      if (options.handleChunk) {
        options.handleChunk(data);
      }
    });
    emitter.on('chatGPTComplete', (data) => {
      resolve(data);
      emitter.off('chatGPTChunck');
      emitter.off('chatGPTComplete');
    });
  });
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
