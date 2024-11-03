import { validate } from '@share/TypeChatSlim/utools';
import { getDynamicFormConfig } from '@share/utils/dynamicForm';
import {
  askChatGPT as askOpenai,
  getBlockJsonValidSchema,
} from '@share/utils/uTools';

export type MethodHandle = (data: {
  method: string;
  params: string;
  model: object;
  scriptFile: string;
}) => Promise<{
  /** 立即更新 model */
  updateModelImmediately?: boolean;
  /** 仅更新参数 */
  onlyUpdateParams?: boolean;
  params?: string;
  /** 打开 Chat */
  showChat?: boolean;
  /** Chat Content */
  chatContent?: string;
  model: object;
}>;

// #region 获取动态表单配置

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

// #endregion

// #region 动态表单页面 LLM 交互

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

export type AskChatGPTForDynamicFormPageWebviewData = {
  params: string;
  model: object;
  scriptFile: string;
  messages: LLMMessage;
  handleChunk: (chunck: string) => void;
};
type AskChatGPTForDynamicFormPage = (
  data: AskChatGPTForDynamicFormPageWebviewData & {
    /** 用于校验 json 数据的 TS 类型名称 */
    validateJsonSchemaTypeName?: string;
  },
) => Promise<{
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
}>;

export const baseAskChatGPTForDynamicFormPage: AskChatGPTForDynamicFormPage =
  async (data) => {
    const res = await askOpenai({
      messages: data.messages,
      handleChunk: data.handleChunk,
    });
    if (!data.validateJsonSchemaTypeName) {
      return {
        content: res.content,
        updateModelImmediately: false,
        onlyUpdateParams: true,
        params: data.params,
        closeChat: false,
        model: data.model,
      };
    }
    const valid = validate(
      res.content,
      getBlockJsonValidSchema(data.scriptFile),
      data.validateJsonSchemaTypeName,
    );
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
    data.handleChunk(`

${valid.message}`);

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
