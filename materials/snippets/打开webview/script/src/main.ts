import { window, Range, env } from 'vscode';
import { showWebView } from '../../../../../share/WebView';
import { context } from './context';

export async function bootstrap() {
  const { lowcodeContext } = context;
  showWebView({
    key: 'main',
    task: { task: 'route', data: { path: '/getClipboardImage' } },
  });
}
