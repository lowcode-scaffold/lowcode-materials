/* eslint-disable no-continue */
/* eslint-disable no-shadow */
import * as https from 'https';
import * as http from 'http';
import { TextDecoder } from 'util';
import { oneAPIConfig } from '../utils/shareData';

export const createChatCompletion = (options: {
  apiKey?: string;
  hostname?: string;
  apiPath?: string;
  port?: number;
  notHttps?: boolean;
  model?: string;
  maxTokens?: number;
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
    const config = oneAPIConfig();
    let combinedResult = '';
    let error = '发生错误：';
    const h = options.notHttps || config?.notHttps ? http : https;
    const request = h.request(
      {
        hostname: options.hostname || config?.hostname || 'api.openai.com',
        port: options.port || config?.port || 443,
        path: options.apiPath || config?.apiPath || '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${options.apiKey || config?.apiKey}`,
        },
      },
      (res) => {
        let preDataLast = '';
        res.on('data', async (chunk) => {
          const text = new TextDecoder('utf-8').decode(chunk);
          const data = text.split('\n\n').filter((s) => s);
          for (let i = 0; i < data.length; i++) {
            try {
              let element = data[i];
              if (i === data.length - 1 && !data[i].endsWith('}')) {
                preDataLast = data[i];
                continue;
              }
              if (element.startsWith('data: ')) {
                if (element.trim() === 'data:') {
                  // 处理只返回了 data: 的情况
                  continue;
                }
              } else {
                // 处理没有 data 开头
                element = preDataLast + element;
              }
              if (element.startsWith('data: ')) {
                if (element.includes('[DONE]')) {
                  if (options.handleChunk) {
                    options.handleChunk({ text: '' });
                  }
                  continue;
                }
                // remove 'data: '
                const data = JSON.parse(element.replace('data: ', ''));
                if (data.finish_reason === 'stop') {
                  if (options.handleChunk) {
                    options.handleChunk({ text: '' });
                  }
                  continue;
                }
                const openaiRes = data.choices[0].delta.content;
                console.log(openaiRes);
                if (openaiRes) {
                  if (options.handleChunk) {
                    options.handleChunk({
                      text: openaiRes.replaceAll('\\n', '\n'),
                    });
                  }
                  combinedResult += openaiRes;
                }
              } else {
                console.log('no includes data: ', element);
                if (options.handleChunk) {
                  options.handleChunk({ text: element });
                }
              }
            } catch (e) {
              console.error({
                e: (e as Error).toString(),
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
      model: options.model || config?.model || 'gpt-3.5-turbo',
      messages: options.messages,
      stream: true,
      max_tokens: options.maxTokens || config?.maxTokens || 2000,
    };
    request.on('error', (error) => {
      // eslint-disable-next-line no-unused-expressions
      options.handleChunk && options.handleChunk({ text: error.toString() });
      resolve(error.toString());
    });
    request.write(JSON.stringify(body));
    request.end();
  });
