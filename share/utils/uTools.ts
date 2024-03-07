import { clipboard } from 'electron';
import { createChatCompletion } from '../LLM/openaiV2';

export const getOpenaiApiKey = () =>
  new Promise<string>((resolve, reject) => {
    // utools.dbStorage.removeItem('lowcode.openaiApiKey'); // 需要更新 api key 的时候打开
    const cacheKey = utools.dbStorage.getItem('lowcode.openaiApiKey');
    if (cacheKey) {
      resolve(cacheKey);
      return;
    }
    const oldClip = clipboard.readText();
    utools.showNotification('请在输入框中粘贴 api key');
    utools.setSubInput(
      (input) => {
        const key = (input as unknown as { text: string }).text;
        utools.dbStorage.setItem('lowcode.openaiApiKey', key);
        clipboard.writeText(oldClip);
        resolve(key);
      },
      '请粘贴 api key',
      true,
    );
  });

export const screenCapture = () =>
  new Promise<string>((resolve, reject) => {
    utools.screenCapture((res) => {
      resolve(res);
    });
  });

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
export const askChatGPT = async (data: {
  messages: LLMMessage;
  handleChunk: (chunck: string) => void;
}) => {
  const apiKey = await getOpenaiApiKey();
  const res = await createChatCompletion({
    apiKey,
    hostname: 'api.chatanywhere.com.cn',
    messages: data.messages,
    handleChunk(chunck) {
      data.handleChunk(chunck.text || '');
    },
  });
  return { content: res };
};
