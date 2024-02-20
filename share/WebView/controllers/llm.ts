import * as vscode from 'vscode';
import { CompileContext } from 'lowcode-context';
import { createChatCompletion } from '../../LLM';
import { IMessage } from '../type';
import { invokeLLMChunkCallback } from '../callback';

type LLMMessage = (
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

export const askLLM = async (
  message: IMessage<{ messages: LLMMessage; llm?: 'gemini' | 'geminiProxy' }>,
  lowcodeContext: {
    webview: vscode.Webview;
  } & CompileContext,
) => {
  const res = await createChatCompletion({
    messages: message.data.messages,
    lowcodeContext,
    handleChunk(data) {
      invokeLLMChunkCallback(lowcodeContext.webview, message.cbid, {
        content: data.text,
      });
    },
    llm: message.data.llm,
  });

  return {
    content: res,
  };
};
