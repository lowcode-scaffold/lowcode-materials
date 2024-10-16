import * as path from 'path';
import { window } from 'vscode';
import * as fs from 'fs-extra';
import { context } from './context';
import { renderEjsTemplates } from '../../../../../share/utils/ejs';

export async function bootstrap() {
  const { lowcodeContext } = context;
  const result = await window.showQuickPick(
    [
      'uniapp/vue3-mvp',
      'uniapp/vue3-mvp emit',
      'uniapp/vue3-mvp props',
      'uniapp/vue3-mvp props emit',
      'lowcode/代码片段',
      'uTools 自动化脚本',
      'uTools 动态表单',
    ].map((s) => s),
    { placeHolder: '请选择模板' },
  );
  if (!result) {
    return;
  }
  const tempWorkPath = path.join(
    lowcodeContext?.env.rootPath || '',
    '.lowcode',
  );
  fs.copySync(path.join(lowcodeContext?.materialPath || ''), tempWorkPath);
  await renderEjsTemplates(
    {
      createBlockPath: path
        .join(lowcodeContext?.explorerSelectedPath || '')
        .replace(/\\/g, '/'),
    },
    path.join(tempWorkPath, 'src'),
  );
  fs.copySync(
    path.join(tempWorkPath, 'src', result),
    path.join(lowcodeContext?.explorerSelectedPath || ''),
  );
  fs.removeSync(tempWorkPath);
}
