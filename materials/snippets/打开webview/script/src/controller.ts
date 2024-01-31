import * as vscode from 'vscode';
import { CompileContext } from 'lowcode-context';
import { createChatCompletion } from '../../../../../share/LLM/gemini';
import { invokeLLMChunkCallback } from '../../../../../share/WebView/callback';
import { IMessage } from '../../../../../share/WebView/type';

const API_KEY = 'lowcode.GeminiKey';

export const getMaterialPath = async (
  message: IMessage<{
    materialPath: string;
    script: string;
    params: string;
  }>,
  context: {
    webview: vscode.Webview;
    task: { task: string; data?: any };
  } & CompileContext,
) => context.materialPath;

export const askGemini = async (
  message: IMessage<{
    sessionId: number;
    messageId: number;
    messages: { role: 'system' | 'user'; content: string }[];
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
        sessionId: message.data.sessionId,
        messageId: message.data.messageId,
        content: 'Please enter your api key',
      });
      return {
        sessionId: message.data.sessionId,
        messageId: message.data.messageId,
        content: 'Please enter your api key',
      };
    }
  }
  const res = await createChatCompletion({
    model: 'gemini-pro',
    apiKey: '',
    messages: message.data.messages,
    handleChunk: (data) => {
      invokeLLMChunkCallback(lowcodeContext.webview, message.cbid, {
        sessionId: message.data.sessionId,
        messageId: message.data.messageId,
        content: data.text,
      });
    },
  });
  return {
    sessionId: message.data.sessionId,
    messageId: message.data.messageId,
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
