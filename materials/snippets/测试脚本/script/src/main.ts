import { window } from 'vscode';

export async function bootstrap() {
  window.onDidChangeWindowState((state) => {
    console.log(state.focused, 123);
  });
}
