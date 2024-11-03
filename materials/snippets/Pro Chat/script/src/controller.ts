import * as vscode from 'vscode';
import { CompileContext } from 'lowcode-context';
import { createChatCompletion } from '@share/LLM/gemini';
import { createChatCompletion as createChatGPTChatCompletion } from '@share/LLM/openai';
import { invokeLLMChunkCallback } from '@share/WebView/callback';
import { IMessage } from '@share/WebView/type';

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

export const askGemini = async (
  message: IMessage<{
    messages: Message;
  }>,
  lowcodeContext: {
    webview: vscode.Webview;
  } & CompileContext,
) => {
  const context = lowcodeContext.env.extensionContext;
  // await context.secrets.delete(API_KEY); // 需要更新 API KEY 的时候打开
  let apiKey = await context.secrets.get(API_KEY);

  if (!apiKey) {
    vscode.window.showWarningMessage('Enter your API KEY to save it securely.');
    apiKey = await setApiKey(context);
    if (!apiKey) {
      invokeLLMChunkCallback(lowcodeContext.webview, message.cbid, {
        content: 'Please enter your api key',
      });
      return {
        content: 'Please enter your api key',
      };
    }
  }
  const res = await createChatCompletion({
    model: message.data.messages.some(
      (s) =>
        Array.isArray(s.content) &&
        s.content.some((c) => c.type === 'image_url'),
    )
      ? 'gemini-pro-vision'
      : 'gemini-pro',
    apiKey,
    messages: message.data.messages,
    handleChunk: (data) => {
      invokeLLMChunkCallback(lowcodeContext.webview, message.cbid, {
        content: data.text,
      });
    },
    proxyUrl: 'http://127.0.0.1:7890',
  });
  return {
    content: res,
  };
};

export const askChatGPT = async (
  message: IMessage<{
    messages: Message;
  }>,
  lowcodeContext: {
    webview: vscode.Webview;
  } & CompileContext,
) => {
  const res = await createChatGPTChatCompletion({
    model: message.data.messages.some(
      (s) =>
        Array.isArray(s.content) &&
        s.content.some((c) => c.type === 'image_url'),
    )
      ? 'gpt-4-vision-preview'
      : undefined,
    messages: message.data.messages,
    handleChunk: (data) => {
      invokeLLMChunkCallback(lowcodeContext.webview, message.cbid, {
        content: data.text,
      });
    },
  });
  return {
    content: res,
  };
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
