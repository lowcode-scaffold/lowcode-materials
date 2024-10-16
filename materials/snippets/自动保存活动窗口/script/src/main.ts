import { Uri, commands, env, window, workspace } from 'vscode';
import { saveShareData } from '../../../../../share/utils/shareData';
import { context } from './context';

export function onActivate() {
  const { lowcodeContext } = context;
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

  // 获取选中的文件夹
  const getSelectedFolder = commands.registerCommand(
    'lowcode.getSelectedFolder',
    async () => {
      const oriClipboardText = await env.clipboard.readText();
      await commands.executeCommand('copyFilePath');
      const folder = await env.clipboard.readText();
      env.clipboard.writeText(oriClipboardText);
      const newUri = Uri.file(folder);
      saveShareData({
        selectedFolder:
          process.platform === 'win32' && newUri.path.startsWith('/')
            ? newUri.path.substring(1)
            : newUri.path,
      });
      console.log(newUri.path);
    },
  );
  setTimeout(() => {
    lowcodeContext?.env.extensionContext.subscriptions.push(getSelectedFolder);
  }, 500);
}
