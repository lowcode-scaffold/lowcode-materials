import { createChatCompletion } from '../../../share/LLM/openaiV2';
import { getOpenaiApiKey } from '../../../share/utils/uTools';

export const bootstrap = async (path?: string) => {
  utools.redirect(['lowcode', '低代码工具'], {
    type: 'text',
    data: `chat|${path || ''}`,
  });
};

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

export const askChatGPT = async (data: { messages: LLMMessage }) => {
  const apiKey = await getOpenaiApiKey();
  const res = await createChatCompletion({
    apiKey,
    hostname: 'api.chatanywhere.com.cn',
    messages: data.messages,
  });
  return { content: res };
};
