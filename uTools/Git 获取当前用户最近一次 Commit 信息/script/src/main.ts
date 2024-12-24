import { clipboard } from 'electron';
import * as execa from 'execa';
import { getShareData } from '@share/utils/shareData';

export const bootstrap = (scriptFile?: string) => {
  const { activeWindow } = getShareData();
  try {
    const projectPath =
      utools.isWindows() && activeWindow?.startsWith('/')
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
      utools.outPlugin();
      utools.hideMainWindowPasteText(res.stdout);
      return;
    }
    return JSON.stringify(res);
  } catch (ex) {
    return (ex as object).toString();
  }
};
