import { platform } from 'os';
import * as execa from 'execa';
import { window, env } from 'vscode';
import { getShareData } from '@share/utils/shareData';

export function bootstrap() {
  const { activeWindow } = getShareData();
  try {
    const projectPath =
      platform() === 'win32' && activeWindow?.startsWith('/')
        ? activeWindow.substring(1)
        : activeWindow;
    const userName = execa.sync('git', [
      '-C',
      projectPath || '.',
      'config',
      'user.name',
    ]);
    const res = execa.sync('git', [
      '-C',
      projectPath || '.',
      'log',
      '-1',
      '--pretty=format:%s',
      `--author=${userName.stdout}`,
      // 'log -1 --pretty=format:"%s" --author="$(git config user.name)"',
    ]);
    if (res.stdout) {
      env.clipboard.writeText(res.stdout);
      window.showInformationMessage(`内容已复制到剪贴板：${res.stdout}`);
      return;
    }
    window.showInformationMessage(`数据异常${JSON.stringify(res)}`);
  } catch (ex) {
    window.showInformationMessage(`数据异常${(ex as object).toString()}`);
  }
}
