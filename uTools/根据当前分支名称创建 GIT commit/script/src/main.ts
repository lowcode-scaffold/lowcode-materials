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
    const res = execa.sync('git', [
      '-C',
      projectPath || '.',
      'rev-parse',
      '--abbrev-ref',
      'HEAD',
    ]);
    if (res.stdout) {
      const match = res.stdout.match(/T(\d+)_/);
      if (match && match[1]) {
        utools.outPlugin();
        utools.hideMainWindowPasteText(`feat(T${match[1]}): #${match[1]}/`);
        return res.stdout;
      }
      utools.outPlugin();
      utools.hideMainWindowPasteText(res.stdout);
      return;
    }
    return JSON.stringify(res);
  } catch (ex) {
    return (ex as object).toString();
  }
};
