import * as vscode from 'vscode';
import { CompileContext } from 'lowcode-context';
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

export const runDynamicFormScript: RunDynamicFormScript = async (
  message,
  lowcodeContext,
) => {
  return Promise.resolve({
    model: message.data.model,
    updateModelImmediately: false,
    onlyUpdateParams: true,
    params: `执行了方法：${message.data.method}`,
  });
};
