/* eslint-disable no-shadow */
import * as https from 'https';
import { TextDecoder } from 'util';
import { workspace } from 'vscode';

type ChatGPTConfig = {
  hostname: string;
  apiPath: string;
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
};
export const getChatGPTConfig: () => ChatGPTConfig = () => {
  const hostname = workspace
    .getConfiguration('lowcode')
    .get<string>('hostname', 'api.openai.com');
  const apiPath = workspace
    .getConfiguration('lowcode')
    .get<string>('apiPath', '/v1/chat/completions');
  const apiKey = workspace
    .getConfiguration('lowcode')
    .get<string>('apiKey', '');
  const model = workspace
    .getConfiguration('lowcode')
    .get<string>('model', 'gpt-3.5-turbo');
  const maxTokens = workspace
    .getConfiguration('lowcode')
    .get<number>('maxTokens', 2000);
  const temperature = workspace
    .getConfiguration('lowcode')
    .get<number>('temperature', 0.3);

  return {
    hostname,
    apiPath,
    apiKey,
    model,
    maxTokens,
    temperature,
  };
};

export const createChatCompletion = (options: {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  hostname?: string;
  apiPath?: string;
  messages: {
    role: 'system' | 'user' | 'assistant';
    content:
      | string
      | (
          | {
              type: 'image_url';
              image_url: { url: string };
            }
          | { type: 'text'; text: string }
        )[];
  }[];
  handleChunk?: (data: { text?: string }) => void;
}) =>
  new Promise<string>((resolve, reject) => {
    let combinedResult = '';
    let error = '发生错误：';
    const request = https.request(
      {
        hostname:
          options.hostname || getChatGPTConfig().hostname || 'api.openai.com',
        port: 443,
        path:
          options.apiPath ||
          getChatGPTConfig().apiPath ||
          '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${
            options.apiKey || getChatGPTConfig().apiKey
          }`,
        },
      },
      (res) => {
        res.on('data', async (chunk) => {
          const text = new TextDecoder('utf-8').decode(chunk);
          const data = text.split('\n\n').filter((s) => s);
          for (let i = 0; i < data.length; i++) {
            try {
              let element = data[i];
              if (element.includes('data: ')) {
                if (element.trim() === 'data:') {
                  // 处理只返回了 data: 的情况
                  return;
                }
              } else if (element.includes('delta')) {
                // 处理没有 data 开头
                element = `data: ${element}`;
              }
              if (element.includes('data: ')) {
                if (element.includes('[DONE]')) {
                  if (options.handleChunk) {
                    options.handleChunk({ text: '' });
                  }
                  return;
                }
                // remove 'data: '
                const data = JSON.parse(element.replace('data: ', ''));
                if (data.finish_reason === 'stop') {
                  if (options.handleChunk) {
                    options.handleChunk({ text: '' });
                  }
                  return;
                }
                const openaiRes = data.choices[0].delta.content;
                if (openaiRes) {
                  if (options.handleChunk) {
                    options.handleChunk({
                      text: openaiRes.replaceAll('\\n', '\n'),
                    });
                  }
                  combinedResult += openaiRes;
                }
              } else {
                if (options.handleChunk) {
                  options.handleChunk({
                    text: element,
                  });
                }
                return;
              }
            } catch (e) {
              console.error({
                e,
                element: data[i],
              });
              error = (e as Error).toString();
            }
          }
        });
        res.on('error', (e) => {
          if (options.handleChunk) {
            options.handleChunk({
              text: e.toString(),
            });
          }
          reject(e);
        });
        res.on('end', () => {
          if (error !== '发生错误：') {
            if (options.handleChunk) {
              options.handleChunk({
                text: error,
              });
            }
          }
          resolve(combinedResult || error);
        });
      },
    );
    const body = {
      model: options.model || getChatGPTConfig().model,
      messages: options.messages,
      stream: true,
      max_tokens: options.maxTokens || getChatGPTConfig().maxTokens,
    };
    request.on('error', (error) => {
      // eslint-disable-next-line no-unused-expressions
      options.handleChunk && options.handleChunk({ text: error.toString() });
      resolve(error.toString());
    });
    request.write(JSON.stringify(body));
    request.end();
  });
