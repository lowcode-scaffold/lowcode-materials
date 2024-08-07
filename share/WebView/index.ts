/* eslint-disable no-underscore-dangle */
import * as vscode from 'vscode';
import { window } from 'vscode';
import type { CompileContext } from 'lowcode-context';
import { routes } from './routes';
import { invokeCallback, invokeErrorCallback } from './callback';

type WebViewKeys = 'main' | string;

let webviewPanels: {
  key: WebViewKeys;
  panel: vscode.WebviewPanel;
  disposables: vscode.Disposable[];
}[] = [];

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
        <style>
          .loader {
            position: fixed;
            top: 50%;
            left: 50%;
            width: 160px;
            height: 160px;
            margin: -80px 0px 0px -80px;
            background-color: transparent;
            border-radius: 50%;
            border: 2px solid #e3e4dc;
          }

          .loader:before {
            content: '';
            width: 164px;
            height: 164px;
            display: block;
            position: absolute;
            border: 2px solid #898a86;
            border-radius: 50%;
            top: -2px;
            left: -2px;
            box-sizing: border-box;
            clip: rect(0px, 35px, 35px, 0px);
            z-index: 10;
            animation: rotate infinite;
            animation-duration: 3s;
            animation-timing-function: linear;
          }

          .loader:after {
            content: '';
            width: 164px;
            height: 164px;
            display: block;
            position: absolute;
            border: 2px solid #c1bebb;
            border-radius: 50%;
            top: -2px;
            left: -2px;
            box-sizing: border-box;
            clip: rect(0px, 164px, 150px, 0px);
            z-index: 9;
            animation: rotate2 3s linear infinite;
          }

          .hexagon-container {
            position: relative;
            top: 33px;
            left: 41px;
            border-radius: 50%;
            margin: 0px;
            padding: 0px;
          }

          .hexagon-container li {
            list-style: none;
          }

          .hexagon {
            position: absolute;
            width: 40px;
            height: 23px;
            background-color: #556c82;
          }

          .hexagon:before {
            content: '';
            position: absolute;
            top: -11px;
            left: 0;
            width: 0;
            height: 0;
            border-left: 20px solid transparent;
            border-right: 20px solid transparent;
            border-bottom: 11.5px solid #556c82;
          }

          .hexagon:after {
            content: '';
            position: absolute;
            top: 23px;
            left: 0;
            width: 0;
            height: 0;
            border-left: 20px solid transparent;
            border-right: 20px solid transparent;
            border-top: 11.5px solid #556c82;
          }

          .hexagon.hex_1 {
            top: 0px;
            left: 0px;
            animation: Animasearch 3s ease-in-out infinite;
            animation-delay: 0.2142857143s;
          }

          .hexagon.hex_2 {
            top: 0px;
            left: 42px;
            animation: Animasearch 3s ease-in-out infinite;
            animation-delay: 0.4285714286s;
          }

          .hexagon.hex_3 {
            top: 36px;
            left: 63px;
            animation: Animasearch 3s ease-in-out infinite;
            animation-delay: 0.6428571429s;
          }

          .hexagon.hex_4 {
            top: 72px;
            left: 42px;
            animation: Animasearch 3s ease-in-out infinite;
            animation-delay: 0.8571428571s;
          }

          .hexagon.hex_5 {
            top: 72px;
            left: 0px;
            animation: Animasearch 3s ease-in-out infinite;
            animation-delay: 1.0714285714s;
          }

          .hexagon.hex_6 {
            top: 36px;
            left: -21px;
            animation: Animasearch 3s ease-in-out infinite;
            animation-delay: 1.2857142857s;
          }

          .hexagon.hex_7 {
            top: 36px;
            left: 21px;
            animation: Animasearch 3s ease-in-out infinite;
            animation-delay: 1.5s;
          }

          @keyframes Animasearch {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            15%,
            50% {
              transform: scale(0.5);
              opacity: 0;
            }
            65% {
              transform: scale(1);
              opacity: 1;
            }
          }

          @keyframes rotate {
            0% {
              transform: rotate(0);
              clip: rect(0px, 35px, 35px, 0px);
            }
            50% {
              clip: rect(0px, 40px, 40px, 0px);
            }
            100% {
              transform: rotate(360deg);
              clip: rect(0px, 35px, 35px, 0px);
            }
          }

          @keyframes rotate2 {
            0% {
              transform: rotate(0deg);
              clip: rect(0px, 164px, 150px, 0px);
            }
            50% {
              clip: rect(0px, 164px, 0px, 0px);
              transform: rotate(360deg);
            }
            100% {
              transform: rotate(720deg);
              clip: rect(0px, 164px, 150px, 0px);
            }
          }

          @keyframes rotate3 {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        </style>
				<script>
				   window.vscode = acquireVsCodeApi();
        </script>
				<script type="module" crossorigin src="http://lowcode-utools.oss-cn-beijing.aliyuncs.com/vscode.index.js"></script>
				<link rel="stylesheet" crossorigin href="http://lowcode-utools.oss-cn-beijing.aliyuncs.com/vscode.index.css">
			</head>
			<body>
        <div id="StartLoading" class="loader">
          <ul class="hexagon-container">
            <li class="hexagon hex_1"></li>
            <li class="hexagon hex_2"></li>
            <li class="hexagon hex_3"></li>
            <li class="hexagon hex_4"></li>
            <li class="hexagon hex_5"></li>
            <li class="hexagon hex_6"></li>
            <li class="hexagon hex_7"></li>
          </ul>
        </div>
				<div id="root"></div>
			</body>
		</html>
`;
};

export const showWebView = (options: {
  key: WebViewKeys;
  lowcodeContext: CompileContext;
  title?: string;
  viewColumn?: vscode.ViewColumn;
  /**
   * webview 打开后执行命令，比如转到指定路由
   */
  task?: { task: string; data?: any };
  htmlForWebview?: string;
  routes?: Record<string, any>;
}) => {
  const webview = webviewPanels.find((s) => s.key === options.key);
  if (webview) {
    webview.panel.reveal();
    if (options.task) {
      webview.panel.webview.postMessage({
        cmd: 'vscodePushTask',
        task: options.task.task,
        data: options.task.data,
      });
    }
  } else {
    // 创建 webview 的时候，设置之前 focus 的 activeTextEditor
    // if (vscode.window.activeTextEditor) {
    //   setLastActiveTextEditorId((vscode.window.activeTextEditor as any).id);
    // }
    const panel = vscode.window.createWebviewPanel(
      'lowcode',
      options.title || 'LOW-CODE可视化',
      {
        viewColumn: options.viewColumn || vscode.ViewColumn.Two,
        preserveFocus: true,
      },
      {
        enableScripts: true,
        // localResourceRoots: [
        //   vscode.Uri.file(path.join(getExtensionPath(), 'webview-dist')),
        // ],
        retainContextWhenHidden: true, // webview被隐藏时保持状态，避免被重置
      },
    );
    // panel.iconPath = vscode.Uri.file(
    //   path.join(getExtensionPath(), 'asset', 'icon.png'),
    // );
    panel.webview.html = options.htmlForWebview
      ? options.htmlForWebview
      : getHtmlForWebview();
    const disposables: vscode.Disposable[] = [];
    panel.webview.onDidReceiveMessage(
      async (message: {
        cmd: string;
        cbid: string;
        data: any;
        skipError?: boolean;
      }) => {
        if (options.routes && options.routes[message.cmd]) {
          try {
            const res = await options.routes[message.cmd](message, {
              webview: panel.webview,
              webviewKey: options.key,
              task: options.task,
              ...options.lowcodeContext,
            });
            invokeCallback(panel.webview, message.cbid, res);
          } catch (ex: any) {
            if (!message.skipError) {
              window.showErrorMessage(ex.toString());
            }
            invokeErrorCallback(panel.webview, message.cbid, ex);
          }
        } else if (routes[message.cmd]) {
          try {
            const res = await routes[message.cmd](message, {
              webview: panel.webview,
              webviewKey: options.key,
              task: options.task,
              ...options.lowcodeContext,
            });
            invokeCallback(panel.webview, message.cbid, res);
          } catch (ex: any) {
            if (!message.skipError) {
              window.showErrorMessage(ex.toString());
            }
            invokeErrorCallback(panel.webview, message.cbid, ex);
          }
        } else {
          invokeErrorCallback(
            panel.webview,
            message.cbid,
            `未找到名为 ${message.cmd} 回调方法!`,
          );
          vscode.window.showWarningMessage(
            `未找到名为 ${message.cmd} 回调方法!`,
          );
        }
      },
      null,
      disposables,
    );
    panel.onDidDispose(
      () => {
        panel.dispose();
        while (disposables.length) {
          const x = disposables.pop();
          if (x) {
            x.dispose();
          }
        }
        webviewPanels = webviewPanels.filter((s) => s.key !== options.key);
      },
      null,
      disposables,
    );
    webviewPanels.push({
      key: options.key,
      panel,
      disposables,
    });
    if (options.task) {
      setTimeout(() => {
        panel.webview.postMessage({
          cmd: 'vscodePushTask',
          task: options.task!.task,
          data: options.task!.data,
        });
      }, 500);
    }
  }
};

export const closeWebView = (key: WebViewKeys) => {
  const webviewPanel = webviewPanels.find((s) => s.key === key);
  webviewPanel?.panel.dispose();
  webviewPanels = webviewPanels.filter((s) => s.key !== key);
};
