import { clipboard } from 'electron';
import { getOpenaiApiKey } from '../../../../share/utils/uTools';
import { createChatCompletion } from '../../../../share/LLM/openaiV2';

export const bootstrap = async () => {
  const apiKey = await getOpenaiApiKey();
  const text = clipboard.readText();
  if (!text) {
    utools.showNotification('请先复制内容');
    return;
  }
  const res = await createChatCompletion({
    apiKey,
    hostname: 'api.chatanywhere.com.cn',
    messages: [
      {
        role: 'system',
        content: `你是一个翻译家，你的目标是把英文翻译成中文，请翻译时不要带翻译腔，而是要翻译得自然、流畅和地道，使用优美和高雅的表达方式。请翻译下面用户输入的内容`,
      },
      {
        role: 'user',
        content: text,
      },
    ],
  });
  return res;
};
