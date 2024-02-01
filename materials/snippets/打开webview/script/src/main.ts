import { window } from 'vscode';
import { showWebView } from '../../../../../share/WebView';
import { routes } from './routes';
import { context } from './context';

export async function bootstrap() {
  const { lowcodeContext } = context;
  showWebView({
    key: 'main',
    title: 'lowcode chat',
    viewColumn: 3,
    task: {
      task: 'route',
      data: { path: '/chat', materialPath: lowcodeContext?.materialPath },
    },
    lowcodeContext: {
      ...lowcodeContext!,
    },
    htmlForWebview: getHtmlForWebview(false),
    routes,
  });
}

export async function testScript() {
  const { lowcodeContext } = context;
  window.showInformationMessage('Hello World!');
  const res = await lowcodeContext?.createChatCompletion({
    messages: [{ role: 'user', content: '现在是什么时间' }],
    showWebview: true,
  });
  return res;
}

const getHtmlForWebview = (dev = false) => {
  if (dev) {
    // return `
    // 	<!doctype html>
    // 	<html lang="en">
    // 		<head>
    // 			<script type="module" src="http://127.0.0.1:5173/@vite/client"></script>
    // 	    <script>
    // 				window.vscode = acquireVsCodeApi();
    // 			</script>
    // 			<meta charset="UTF-8" />
    // 			<link rel="icon" type="image/svg+xml" href="http://127.0.0.1:5173/vite.svg" />
    // 			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
    // 			<title>Vite + Vue + TS</title>
    // 		</head>
    // 		<body>
    // 			<div id="root"></div>
    // 			<script type="module" src="http://127.0.0.1:5173/src/main.ts"></script>
    // 		</body>
    // 	</html>
    // `;
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
						<title>Vite + React + TS</title>
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
				<script type="module" crossorigin src="https://lowcode-webview-react-vite.ruoxie.site/js/index.js"></script>
				<link rel="stylesheet" crossorigin href="https://lowcode-webview-react-vite.ruoxie.site/css/index.css">
			</head>
			<body>
				<div id="root"></div>
			</body>
		</html>
`;
};
