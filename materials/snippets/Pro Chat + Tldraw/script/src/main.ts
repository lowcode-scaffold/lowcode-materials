import { window } from 'vscode';
import { showWebView } from '@share/WebView';
import { routes } from './routes';
import { context } from './context';

export async function bootstrap() {
  const { lowcodeContext } = context;
  showWebView({
    key: 'main',
    title: 'tldraw make real',
    viewColumn: 3,
    task: {
      task: 'route',
      data: { path: '/tldraw', materialPath: lowcodeContext?.materialPath },
    },
    lowcodeContext: {
      ...lowcodeContext!,
    },
    htmlForWebview: getHtmlForWebview(false),
    routes,
  });
}

const getHtmlForWebview = (dev = false) => {
  if (dev) {
    return `
				<!doctype html>
				<html lang="en">
					<head>
						<script type="module">import { injectIntoGlobalHook } from "http://127.0.0.1:5173/@react-refresh";
						injectIntoGlobalHook(window);
						window.$RefreshReg$ = () => {};
						window.$RefreshSig$ = () => (type) => type;</script>

						<script type="module" src="http://127.0.0.1:5173/@vite/client"></script>
						<script>
							window.vscode = acquireVsCodeApi();
						</script>
						<meta charset="UTF-8" />
						<link rel="icon" type="image/svg+xml" href="http://127.0.0.1:5173/vite.svg" />
						<meta name="viewport" content="width=device-width, initial-scale=1.0" />
					</head>
					<body>
						<div id="root"></div>
						<script type="module" src="http://127.0.0.1:5173/src/main.tsx"></script>
					</body>
				</html>
		`;
  }
  return `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="utf-8" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no"
				/>
				<script>
				   window.vscode = acquireVsCodeApi();
        </script>
				<script type="module" crossorigin src="http://lowcode-utools.oss-cn-beijing.aliyuncs.com/vscode.index.js"></script>
				<link rel="stylesheet" crossorigin href="http://lowcode-utools.oss-cn-beijing.aliyuncs.com/vscode.index.css">
			</head>
			<body>
				<div id="root"></div>
			</body>
		</html>
`;
};
