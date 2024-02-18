/* eslint-disable no-shadow */
import * as https from 'https';
import { TextDecoder } from 'util';
import tunnel from 'tunnel';

const agent = tunnel.httpsOverHttp({
  proxy: {
    host: '127.0.0.1',
    port: 7890,
  },
});

export const createChatCompletion = (options: {
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
    let combinedResult = '';
    let error = '发生错误：';
    const request = https.request(
      {
        hostname: 'api.gemini-chat.pro', // https://github.com/blacksev/Gemini-Next-Web API
        port: 443,
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Referer: 'https://gemini-chat.pro/',
          Origin: 'https://gemini-chat.pro',
        },
        agent,
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
      model: options.model,
      messages: options.messages,
      stream: true,
      max_tokens: options.maxTokens,
      presence_penalty: 0,
      temperature: 0.5,
      top_p: 1,
      frequency_penalty: 0,
    };
    request.on('error', (error) => {
      // eslint-disable-next-line no-unused-expressions
      options.handleChunk && options.handleChunk({ text: error.toString() });
      resolve(error.toString());
      // emitter.emit('chatGPTComplete', error.toString());
    });
    request.write(JSON.stringify(body));
    request.end();
  });
