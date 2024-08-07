import * as vscode from 'vscode';
import { CompileContext } from 'lowcode-context';
import { oneAPIConfig } from '../utils/shareData';
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
  const config = oneAPIConfig();
  if (options.llm === 'gemini') {
    const apiKey = config?.apiKey;

    if (!apiKey) {
      if (options.handleChunk) {
        options.handleChunk({ text: 'Please config your api key' });
      }
      return 'Please config your api key';
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
          emitter.emit('chatGPTChunck', data);
        }
      },
      proxyUrl: config?.proxyUrl || 'http://127.0.0.1:7890',
    });
    emitter.emit('chatGPTComplete', res);
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
          emitter.emit('chatGPTChunck', data);
        }
      },
    });
    emitter.emit('chatGPTComplete', res);
    return res;
  }
  const res = await openai.createChatCompletion({
    messages: options.messages,
    handleChunk(data) {
      if (options.handleChunk) {
        options.handleChunk(data);
        emitter.emit('chatGPTChunck', data);
      }
    },
  });
  emitter.emit('chatGPTComplete', res);
  return res;
};

export const createChatCompletionShowWebView = (options: {
  messages: Message;
  handleChunk?: (data: { text?: string }) => void;
  lowcodeContext: CompileContext;
  llm?: string;
  htmlForWebview?: string;
}) => {
  // 打开 webview，使用 emitter 监听结果，把结果回传给 script
  showWebView({
    key: 'main',
    lowcodeContext: options.lowcodeContext,
    task: {
      task: 'askLLM',
      data: {
        content: options.messages.map((m) => m.content).join('\n'),
        llm: options.llm,
      },
    },
    htmlForWebview: options.htmlForWebview,
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
