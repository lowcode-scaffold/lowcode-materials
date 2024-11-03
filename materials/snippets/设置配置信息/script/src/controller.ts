import * as vscode from 'vscode';
import { CompileContext } from 'lowcode-context';
import { getShareData, saveShareData } from '@share/utils/shareData';
import { getDynamicFormConfig } from '@share/utils/dynamicForm';
import { IMessage } from '@share/WebView/type';

type RunDynamicFormScript = (
  message: IMessage<{
    method: string;
    params: string;
    model: object;
  }>,
  lowcodeContext: {
    webview: vscode.Webview;
  } & CompileContext,
) => Promise<{
  /** 立即更新 model */
  updateModelImmediately: boolean;
  /** 仅更新参数 */
  onlyUpdateParams: boolean;
  params?: string;
  model: object;
}>;

export const getDynamicForm = (
  message: IMessage,
  context: {
    webview: vscode.Webview;
    task: { task: string; data?: any };
  } & CompileContext,
) => {
  const { materialPath } = context;
  const model = getShareData();
  const config = getDynamicFormConfig({
    vscodeMaterialPath: materialPath,
    model,
  });
  return {
    schema: config.schema,
    scripts: config.scripts,
  };
};

export const runDynamicFormScript: RunDynamicFormScript = async (
  message,
  lowcodeContext,
) => {
  if (handler[message.data.method]) {
    return handler[message.data.method](message, lowcodeContext);
  }
  return Promise.reject(`方法：${message.data.method} 不存在`);
};

const handler: {
  [method: string]: RunDynamicFormScript;
} = {
  saveConfig: (message, lowcodeContext) => {
    saveShareData(message.data.model);
    return Promise.resolve({
      model: message.data.model,
      updateModelImmediately: true,
      onlyUpdateParams: false,
      params: '',
    });
  },
};
