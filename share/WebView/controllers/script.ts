/* eslint-disable no-eval */
import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import { CompileContext } from 'lowcode-context';
import { IMessage } from '../type';

export const runScript = async (
  message: IMessage<{
    materialPath: string;
    script: string;
    params: string;
  }>,
  context: {
    webview: vscode.Webview;
    task: { task: string; data?: any };
  } & CompileContext,
) => {
  const scriptFile = path.join(message.data.materialPath, 'script/index.js');
  if (fs.existsSync(scriptFile)) {
    delete eval('require').cache[eval('require').resolve(scriptFile)];
    const script = eval('require')(scriptFile);
    if (script[message.data.script]) {
      const c = {
        ...context,
        params: message.data.params,
        materialPath: message.data.materialPath,
      };
      const scriptRes = await script[message.data.script](c);
      return scriptRes;
    }
    throw new Error(`方法: ${message.data.script} 不存在`);
  } else {
    throw new Error(`脚本文件不存在`);
  }
};
