import { clipboard } from 'electron';
import {
  AskChatGPTForDynamicFormPageWebviewData,
  MethodHandle,
  baseAskChatGPTForDynamicFormPage,
} from '@share/uTools/webviewBaseController';
import * as controller from './controller';

export const bootstrap = async (scriptFile?: string) => {
  utools.redirect(['lowcode', 'lowcode'], {
    type: 'text',
    data: JSON.stringify({ scriptFile, route: '/dynamicForm' }),
  });
};

// #region 给 webview 调用的
export { getDynamicForm } from '@share/uTools/webviewBaseController';

export const askChatGPTForDynamicFormPage = (
  data: AskChatGPTForDynamicFormPageWebviewData,
) => {
  return baseAskChatGPTForDynamicFormPage({
    ...data,
    validateJsonSchemaTypeName: 'PageConfig',
  });
};

export const runDynamicFormScript: MethodHandle = (data) => {
  if (controller[data.method]) {
    return controller[data.method](data);
  }
  return Promise.reject(`方法不存在：${data.method}`);
};

// #endregion
