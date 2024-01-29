import { Content, GoogleGenerativeAI, Part } from '@google/generative-ai';
import { setGlobalDispatcher, ProxyAgent } from 'undici';

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
  apiKey: string;
  model: 'gemini-pro' | 'gemini-pro-vision';
  maxTokens?: number;
  hostname?: string;
  apiPath?: string;
  messages: Message;
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
  try {
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
  } catch (ex: any) {
    if (options.handleChunk) {
      options.handleChunk({ text: ex.toString(), hasMore: false });
    }
    return ex.toString();
  }
};

const openAiMessageToGeminiMessage = (messages: Message): Content[] => {
  const result: Content[] = [];

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
