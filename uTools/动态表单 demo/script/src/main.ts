import { clipboard } from 'electron';
import { getDynamicFormConfig } from '../../../../share/utils/dynamicForm';
import * as controller from './controller';
import { MethodHandle } from './controller';

export const bootstrap = async (scriptFile?: string) => {
  utools.redirect(['lowcode', 'lowcode'], {
    type: 'text',
    data: JSON.stringify({ scriptFile, route: '/dynamicForm' }),
  });
};

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
