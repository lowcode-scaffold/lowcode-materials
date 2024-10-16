import { clipboard } from 'electron';
import { getDynamicFormConfig } from '../../../../share/utils/dynamicForm';
import { askChatGPT as askOpenai } from '../../../../share/utils/uTools';
import * as controller from './controller';
import { MethodHandle } from './controller';

export const bootstrap = async (scriptFile?: string) => {
  utools.redirect(['lowcode', 'lowcode'], {
    type: 'text',
    data: JSON.stringify({ scriptFile, route: '/dynamicForm' }),
  });
};

// #region 给 webview 调用的

type GetDynamicForm = (data: { scriptFile: string }) => Promise<{
  schema: object;
  scripts: { method: string; remark: string }[];
}>;

export const getDynamicForm: GetDynamicForm = (data) => {
  const config = getDynamicFormConfig({ utoolsScriptFile: data.scriptFile });
  return Promise.resolve({
    schema: config.schema,
    scripts: config.scripts,
  });
};

export const runDynamicFormScript: MethodHandle = (data) => {
  if (controller[data.method]) {
    return controller[data.method](data);
  }
  return Promise.reject(`方法不存在：${data.method}`);
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

export const askChatGPTForDynamicFormPage: (data: {
  params: string;
  model: object;
  scriptFile: string;
  messages: LLMMessage;
  handleChunk: (chunck: string) => void;
}) => Promise<{
  /** LLM 返回内容 */
  content: string;
  /** 立即更新 model */
  updateModelImmediately: boolean;
  /** 仅更新参数 */
  onlyUpdateParams: boolean;
  /** 要更新的参数 */
  params?: string;
  /** 关闭 LLM Chat */
  closeChat?: boolean;
  model: object;
}> = async (data: {
  params: string;
  model: object;
  scriptFile: string;
  messages: LLMMessage;
  handleChunk: (chunck: string) => void;
}) => {
  const res = await askOpenai({
    messages: data.messages,
    handleChunk: data.handleChunk,
  });
  const valid = controller.validateJSON({
    jsonText: res.content,
    scriptFile: data.scriptFile,
  });
  if (valid.success) {
    return {
      content: res.content,
      updateModelImmediately: false,
      onlyUpdateParams: false,
      params: data.params,
      closeChat: true,
      model: valid.data,
    };
  }
  return {
    content: res.content,
    updateModelImmediately: false,
    onlyUpdateParams: true,
    params: valid.message,
    closeChat: false,
    model: data.model,
  };
};

// #endregion
