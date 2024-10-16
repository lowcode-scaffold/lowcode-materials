import { clipboard } from 'electron';
import { askChatGPT as askOpenai } from '../../../../share/utils/uTools';

export const bootstrap = async (scriptFile?: string) => {
  const clipboardText =
    (clipboard.readText() || '').trim() ||
    '客户验收状态:1.无需验收、2.待验收、3已验收';
  const requestPrompt =
    `You are a service that translates user requests into TypeScript Interface， use value as a comment in JSDoc format:\n` +
    `The following is a user request:\n` +
    `"""\n${clipboardText}\n"""\n`;
  utools.redirect(['lowcode', 'lowcode'], {
    type: 'text',
    data: JSON.stringify({
      scriptFile,
      route: '/chat',
      content: requestPrompt,
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
}) => askOpenai({ ...data });
