import { window } from 'vscode';

export async function bootstrap() {
  window.onDidChangeWindowState((state) => {
    console.log(state.focused, 123);
  });
}

export function onActivate() {
  // window.showInformationMessage('你好');
}
