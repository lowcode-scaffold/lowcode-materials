import { askChatGPT as askOpenai } from '@share/utils/uTools';
import { AskChatGPT } from '@share/uTools/webviewBaseController';

export const bootstrap = async (scriptFile?: string) => {
  utools.redirect(['lowcode', 'lowcode'], {
    type: 'text',
    data: JSON.stringify({
      scriptFile,
      route: '/chat',
    }),
  });
};

// 给页面调用的
export const askChatGPT: AskChatGPT = (data) =>
  askOpenai({ ...data, model: undefined });
