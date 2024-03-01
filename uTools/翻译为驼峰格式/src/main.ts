import { clipboard } from 'electron';
import { getOpenaiApiKey } from '../../../share/utils/uTools';
import { createChatCompletion } from '../../../share/LLM/openaiV2';

export const bootstrap = async () => {
  const apiKey = await getOpenaiApiKey();
  const text = clipboard.readText();
  if (!text) {
    utools.showNotification('请先复制内容');
    return;
  }
  let res = await createChatCompletion({
    apiKey,
    hostname: 'api.chatanywhere.com.cn',
    messages: [
      {
        role: 'system',
        content: `你是一个翻译家，你的目标是把中文翻译成英文单词，请翻译时使用驼峰格式，小写字母开头，不要带翻译腔，而是要翻译得自然、流畅和地道，使用优美和高雅的表达方式。请翻译下面用户输入的内容`,
      },
      {
        role: 'user',
        content: text,
      },
    ],
  });
  res = res.charAt(0).toLowerCase() + res.slice(1);
  utools.outPlugin();
  utools.hideMainWindowPasteText(res);
  return res;
};
