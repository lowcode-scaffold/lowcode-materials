/* eslint-disable no-underscore-dangle */
import * as vscode from 'vscode';
import { window } from 'vscode';
import { CompileContext } from 'lowcode-context';
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

export const showWebView = (options: {
  key: WebViewKeys;
  title?: string;
  viewColumn?: vscode.ViewColumn;
  /**
   * webview 打开后执行命令，比如转到指定路由
   */
  task?: { task: string; data?: any };
  htmlForWebview?: string;
  lowcodeContext?: CompileContext;
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
      : getHtmlForWebview(true);
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
