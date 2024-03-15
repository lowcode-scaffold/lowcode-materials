import { clipboard } from 'electron';
import { askChatGPT as askOpenai } from '../../../../share/utils/uTools';

export const bootstrap = async (scriptFile?: string) => {
  utools.redirect(['lowcode', 'lowcode'], {
    type: 'text',
    data: JSON.stringify({
      scriptFile,
      route: '/chat',
      content: clipboard.readText(),
    }),
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

// 给页面调用的
export const askChatGPT = (data: {
  messages: LLMMessage;
  handleChunk: (chunck: string) => void;
}) => askOpenai({ ...data, hostname: 'api.chatanywhere.com.cn' });
