/* eslint-disable no-eval */
import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import { IMessage } from '../type';

export const runScript = async (
  message: IMessage<{
    materialPath: string;
    script: string;
    params: string;
  }>,
) => {
  const scriptFile = path.join(message.data.materialPath, 'script/index.js');
  if (fs.existsSync(scriptFile)) {
    delete eval('require').cache[eval('require').resolve(scriptFile)];
    const script = eval('require')(scriptFile);
    if (script[message.data.script]) {
      const context = {
        params: message.data.params,
        materialPath: message.data.materialPath,
      };
      const extendModel = await script[message.data.script](context);
      return extendModel;
    }
    throw new Error(`方法: ${message.data.script} 不存在`);
  } else {
    throw new Error(`脚本文件不存在`);
  }
};
