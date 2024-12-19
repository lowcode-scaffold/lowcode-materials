import {
  AskChatGPT,
  LLMMessage,
  MethodHandle,
} from '@share/uTools/webviewBaseController';
import { askChatGPT as askOpenai } from '@share/utils/uTools';
import * as controller from './controller';

export const bootstrap = async (scriptFile?: string) => {
  utools.redirect(['lowcode', 'lowcode'], {
    type: 'text',
    data: JSON.stringify({
      scriptFile,
      route: '/chat',
      form: {
        name: 123,
      },
    }),
  });
};

// 给页面调用的
export const askChatGPT: AskChatGPT = async (data: {
  messages: LLMMessage;
  handleChunk: (chunck: string) => void;
  model?: object;
}) => {
  // data.handleChunk(JSON.stringify(data.model || { a: 123 }));
  const res = await askOpenai({ ...data, model: undefined });
  return {
    content: res.content,
    showForm: true,
    updateModelImmediately: true,
    model: {
      ...data.model,
      items: [
        {
          label: 'A',
          value: 'a',
        },
        {
          label: 'B',
          value: 'b',
        },
        {
          label: 'C',
          value: 'c',
        },
      ],
    },
  };
};

export const runDynamicFormScript: MethodHandle = (data) => {
  if (controller[data.method]) {
    return controller[data.method](data);
  }
  return Promise.reject(`方法不存在：${data.method}`);
};
