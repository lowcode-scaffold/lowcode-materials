import { Content, GoogleGenerativeAI, Part } from '@google/generative-ai';
import { setGlobalDispatcher, ProxyAgent } from 'undici';

export const createChatCompletion = async (options: {
  apiKey: string;
  model: 'gemini-pro' | 'gemini-pro-vision';
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
  handleChunk?: (data: { text?: string; hasMore: boolean }) => void;
  topP?: number;
  temperature?: number;
  proxyUrl?: string;
}) => {
  if (options.proxyUrl) {
    const dispatcher = new ProxyAgent({
      uri: new URL(options.proxyUrl).toString(),
    });
    setGlobalDispatcher(dispatcher);
  }
  const genAI = new GoogleGenerativeAI(options.apiKey);
  const model = genAI.getGenerativeModel({
    model: options.model,
    generationConfig: {
      maxOutputTokens: options.maxTokens,
      temperature: options.temperature,
      topP: options.topP,
    },
  });
  const result = await model.generateContentStream({
    contents: openAiMessageToGeminiMessage(options.messages),
  });
  let combinedResult = '';
  // eslint-disable-next-line no-restricted-syntax
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    if (options.handleChunk) {
      options.handleChunk({ text: chunkText, hasMore: false });
    }
    combinedResult += chunkText;
  }
  return combinedResult;
};

const openAiMessageToGeminiMessage = (
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
  }[],
): Content[] => {
  const result: Content[] = messages
    .flatMap(({ role, content }) => {
      if (role === 'system') {
        return [
          { role: 'user', parts: [{ text: content }] },
          { role: 'model', parts: [{ text: '' }] },
        ];
      }

      const parts: Part[] =
        content == null || typeof content === 'string'
          ? [{ text: content?.toString() ?? '' }]
          : content.map((item) =>
              item.type === 'text'
                ? { text: item.text }
                : parseBase64(item.image_url.url),
            );

      return [{ role: role === 'user' ? 'user' : 'model', parts }];
    })
    .flatMap((item, idx, arr) => {
      if (item.role === arr.at(idx + 1)?.role && item.role === 'user') {
        return [item, { role: 'model', parts: [{ text: '' }] }];
      }
      return [item];
    });

  return result;
};

const parseBase64 = (base64: string): Part => {
  if (!base64.startsWith('data:')) {
    return { text: '' };
  }
  const [m, data, ..._arr] = base64.split(',');
  const mimeType = m.match(/:(?<mime>.*?);/)?.groups?.mime ?? 'img/png';
  return {
    inlineData: {
      mimeType,
      data,
    },
  };
};
