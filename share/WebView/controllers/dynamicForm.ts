import * as vscode from 'vscode';
import { CompileContext } from 'lowcode-context';
import { IMessage } from '../type';
import { getDynamicFormConfig } from '../../../share/utils/dynamicForm';

export const getDynamicForm = (
  message: IMessage,
  context: {
    webview: vscode.Webview;
    task: { task: string; data?: any };
  } & CompileContext,
) => {
  const { materialPath } = context;
  const config = getDynamicFormConfig({ vscodeMaterialPath: materialPath });
  return {
    schema: config.schema,
    scripts: config.scripts,
  };
};
