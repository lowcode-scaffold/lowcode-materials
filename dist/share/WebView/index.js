"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeWebView = exports.showWebView = void 0;
/* eslint-disable no-underscore-dangle */
const vscode = __importStar(require("vscode"));
const vscode_1 = require("vscode");
const routes_1 = require("./routes");
const callback_1 = require("./callback");
let webviewPanels = [];
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
const showWebView = (options) => {
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
    }
    else {
        // 创建 webview 的时候，设置之前 focus 的 activeTextEditor
        // if (vscode.window.activeTextEditor) {
        //   setLastActiveTextEditorId((vscode.window.activeTextEditor as any).id);
        // }
        const panel = vscode.window.createWebviewPanel('lowcode', options.title || 'LOW-CODE可视化', {
            viewColumn: options.viewColumn || vscode.ViewColumn.Two,
            preserveFocus: true,
        }, {
            enableScripts: true,
            // localResourceRoots: [
            //   vscode.Uri.file(path.join(getExtensionPath(), 'webview-dist')),
            // ],
            retainContextWhenHidden: true, // webview被隐藏时保持状态，避免被重置
        });
        // panel.iconPath = vscode.Uri.file(
        //   path.join(getExtensionPath(), 'asset', 'icon.png'),
        // );
        panel.webview.html = options.htmlForWebview
            ? options.htmlForWebview
            : getHtmlForWebview();
        const disposables = [];
        panel.webview.onDidReceiveMessage(async (message) => {
            if (options.routes && options.routes[message.cmd]) {
                try {
                    const res = await options.routes[message.cmd](message, {
                        webview: panel.webview,
                        webviewKey: options.key,
                        task: options.task,
                        ...options.lowcodeContext,
                    });
                    (0, callback_1.invokeCallback)(panel.webview, message.cbid, res);
                }
                catch (ex) {
                    if (!message.skipError) {
                        vscode_1.window.showErrorMessage(ex.toString());
                    }
                    (0, callback_1.invokeErrorCallback)(panel.webview, message.cbid, ex);
                }
            }
            else if (routes_1.routes[message.cmd]) {
                try {
                    const res = await routes_1.routes[message.cmd](message, {
                        webview: panel.webview,
                        webviewKey: options.key,
                        task: options.task,
                        ...options.lowcodeContext,
                    });
                    (0, callback_1.invokeCallback)(panel.webview, message.cbid, res);
                }
                catch (ex) {
                    if (!message.skipError) {
                        vscode_1.window.showErrorMessage(ex.toString());
                    }
                    (0, callback_1.invokeErrorCallback)(panel.webview, message.cbid, ex);
                }
            }
            else {
                (0, callback_1.invokeErrorCallback)(panel.webview, message.cbid, `未找到名为 ${message.cmd} 回调方法!`);
                vscode.window.showWarningMessage(`未找到名为 ${message.cmd} 回调方法!`);
            }
        }, null, disposables);
        panel.onDidDispose(() => {
            panel.dispose();
            while (disposables.length) {
                const x = disposables.pop();
                if (x) {
                    x.dispose();
                }
            }
            webviewPanels = webviewPanels.filter((s) => s.key !== options.key);
        }, null, disposables);
        webviewPanels.push({
            key: options.key,
            panel,
            disposables,
        });
        if (options.task) {
            setTimeout(() => {
                panel.webview.postMessage({
                    cmd: 'vscodePushTask',
                    task: options.task.task,
                    data: options.task.data,
                });
            }, 500);
        }
    }
};
exports.showWebView = showWebView;
const closeWebView = (key) => {
    const webviewPanel = webviewPanels.find((s) => s.key === key);
    webviewPanel?.panel.dispose();
    webviewPanels = webviewPanels.filter((s) => s.key !== key);
};
exports.closeWebView = closeWebView;
