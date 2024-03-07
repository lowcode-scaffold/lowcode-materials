import { askChatGPT as askOpenai } from '../../../share/utils/uTools';

export const bootstrap = async (scriptFile?: string) => {
  utools.redirect(['lowcode', '低代码工具'], {
    type: 'text',
    data: JSON.stringify({ scriptFile, route: '/chat' }),
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

export const askChatGPT = (data: {
  messages: LLMMessage;
  handleChunk: (chunck: string) => void;
}) => askOpenai(data);
