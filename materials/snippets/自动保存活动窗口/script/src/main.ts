import { window, workspace } from 'vscode';
import { saveShareData } from '../../../../../share/utils/shareData';

export function onActivate() {
  saveShareData({
    activeWindow:
      (workspace.workspaceFolders && workspace.workspaceFolders[0].uri.path) ||
      '',
  });
  window.onDidChangeWindowState((state) => {
    if (state.focused) {
      saveShareData({
        activeWindow:
          (workspace.workspaceFolders &&
            workspace.workspaceFolders[0].uri.path) ||
          '',
      });
    }
  });
}
