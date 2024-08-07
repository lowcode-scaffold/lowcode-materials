import * as vscode from 'vscode';
import { CompileContext } from 'lowcode-context';
import { IMessage } from '../../../../../share/WebView/type';

type RunDynamicFormScript = (
  message: IMessage<{
    method: string;
    params: string;
    model: any;
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
  model: any;
}>;

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
  askChatGPT: async (message, lowcodeContext) => {
    const prompt = `目前有变量 ${message.data.model.originalVariable}，类型为：
"""
${message.data.model.originalType}
"""
以及变量 ${message.data.model.targetVariable || 'model'}，类型为：
"""
${message.data.model.targetType}
"""
请根据注释或者字段名称把变量 ${
      message.data.model.originalVariable
    } 的每个字段赋值给变量 ${
      message.data.model.targetVariable || 'model'
    } 的相应字段，按下面的方式进行赋值：
"""
{
	a: ${message.data.model.originalVariable}.a,
	b: ${message.data.model.originalVariable}.b,
	c: ${message.data.model.originalVariable}.c,
	d: ${message.data.model.originalVariable}.d,
}
"""
    `;
    const res = await lowcodeContext.createChatCompletion({
      messages: [{ content: prompt, role: 'user' }],
      showWebview: true,
    });
    return {
      model: message.data.model,
      updateModelImmediately: false,
      onlyUpdateParams: true,
      params: res,
    };
  },
};
