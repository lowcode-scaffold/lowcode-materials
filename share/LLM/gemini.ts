import { Content, GoogleGenerativeAI, Part } from '@google/generative-ai';
import { setGlobalDispatcher, ProxyAgent } from 'undici';
import { oneAPIConfig } from '../utils/shareData';

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
  apiKey?: string;
  model?: 'gemini-pro' | 'gemini-pro-vision';
  maxTokens?: number;
  hostname?: string;
  apiPath?: string;
  messages: Message;
  handleChunk?: (data: { text?: string }) => void;
  topP?: number;
  temperature?: number;
  proxyUrl?: string;
}) => {
  const config = oneAPIConfig();
  if (options.proxyUrl || config?.proxyUrl) {
    const dispatcher = new ProxyAgent({
      uri: new URL(options.proxyUrl || config?.proxyUrl || '').toString(),
    });
    setGlobalDispatcher(dispatcher);
  }
  const genAI = new GoogleGenerativeAI(options.apiKey || config?.apiKey || '');
  const model = genAI.getGenerativeModel({
    model: options.model || config?.model || '',
    generationConfig: {
      maxOutputTokens: options.maxTokens || config?.maxTokens,
      temperature: options.temperature,
      topP: options.topP,
    },
  });
  try {
    const result = await model.generateContentStream({
      contents: openAiMessageToGeminiMessage(options.messages),
    });
    let combinedResult = '';
    // eslint-disable-next-line no-restricted-syntax
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (options.handleChunk) {
        options.handleChunk({ text: chunkText });
      }
      combinedResult += chunkText;
    }
    return combinedResult;
  } catch (ex: any) {
    if (options.handleChunk) {
      options.handleChunk({ text: ex.toString() });
    }
    return ex.toString();
  }
};

const openAiMessageToGeminiMessage = (messages: Message): Content[] => {
  const result: Content[] = [];
  const hasImage = messages.some(
    (s) =>
      Array.isArray(s.content) && s.content.some((c) => c.type === 'image_url'),
  );
  if (hasImage) {
    result.push({ role: 'user', parts: [] });
    const partsText: string[] = [];
    let imagePart!: Part;
    for (let i = 0; i < messages.length; i++) {
      const { role, content } = messages[i];
      if (role === 'system') {
        partsText.push(content);
        // eslint-disable-next-line no-continue
        continue;
      }

      if (content == null || typeof content === 'string') {
        partsText.push(content || '');
      } else {
        for (let j = 0; j < content.length; j++) {
          const item = content[j];
          if (item.type === 'text') {
            partsText.push(item.text || '');
          } else {
            imagePart = parseBase64(
              (item as { type: 'image_url'; image_url: { url: string } })
                .image_url.url,
            );
          }
        }
      }
    }
    result[0].parts = [{ text: partsText.join('\n') }, imagePart];
  } else {
    for (let i = 0; i < messages.length; i++) {
      const { role, content } = messages[i];
      const parts: Part[] = [];
      if (role === 'system') {
        result.push({ role: 'user', parts: [{ text: content as string }] });
        result.push({ role: 'model', parts: [{ text: '' }] });
        // eslint-disable-next-line no-continue
        continue;
      }

      if (content == null || typeof content === 'string') {
        parts.push({ text: content?.toString() ?? '' });
      } else {
        for (let j = 0; j < content.length; j++) {
          const item = content[j];
          parts.push(
            item.type === 'text'
              ? { text: item.text }
              : parseBase64(
                  (item as { type: 'image_url'; image_url: { url: string } })
                    .image_url.url,
                ),
          );
        }
      }

      result.push({ role: role === 'user' ? 'user' : 'model', parts });

      if (
        i < messages.length - 1 &&
        messages[i + 1].role === 'user' &&
        role === 'user'
      ) {
        result.push({ role: 'model', parts: [{ text: '' }] });
      }
    }
  }
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
