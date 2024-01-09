/* eslint-disable no-underscore-dangle */
import * as vscode from 'vscode';
import { window } from 'vscode';
import { routes } from './routes';
import { invokeCallback, invokeErrorCallback } from './callback';

type WebViewKeys = 'main' | string;

type Tasks = 'test';

let webviewPanels: {
  key: WebViewKeys;
  panel: vscode.WebviewPanel;
  disposables: vscode.Disposable[];
}[] = [];

const getHtmlForWebview = () => {
  const mianScriptUri = 'http://localhost:8000/main.js';
  const vendorsScriptUri = 'http://localhost:8000/vendors.js';

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
				    window.routerBase = "/";
				</script>
				<script>
                   window.g_path = "/";
				</script>
				<script>
				   window.vscode = acquireVsCodeApi();
                </script>
			</head>
			<body>
				<div id="root"></div>
				<script src="${vendorsScriptUri}"></script>
				<script src="${mianScriptUri}"></script>
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
  task?: { task: Tasks; data?: any };
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
    panel.webview.html = getHtmlForWebview();
    const disposables: vscode.Disposable[] = [];
    panel.webview.onDidReceiveMessage(
      async (message: {
        cmd: string;
        cbid: string;
        data: any;
        skipError?: boolean;
      }) => {
        if (routes[message.cmd]) {
          try {
            const res = await routes[message.cmd](message, {
              webview: panel.webview,
              webviewKey: options.key,
              task: options.task,
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
      panel.webview.postMessage({
        cmd: 'vscodePushTask',
        task: options.task.task,
        data: options.task.data,
      });
    }
  }
};

export const closeWebView = (key: WebViewKeys) => {
  const webviewPanel = webviewPanels.find((s) => s.key === key);
  webviewPanel?.panel.dispose();
  webviewPanels = webviewPanels.filter((s) => s.key !== key);
};
