"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const vscode_1 = require("vscode");
const LLM_1 = require("../../../../../share/LLM");
const index_1 = require("../../../../../share/TypeChatSlim/index");
const material_1 = require("../../../../../share/utils/material");
const ejs_1 = require("../../../../../share/utils/ejs");
const context_1 = require("./context");
async function bootstrap() {
    const { lowcodeContext } = context_1.context;
    const schema = fs_1.default.readFileSync(path_1.default.join(lowcodeContext.materialPath, 'config/schema.ts'), 'utf8');
    const clipboardText = await vscode_1.env.clipboard.readText();
    const { selection, document } = vscode_1.window.activeTextEditor;
    const selectText = document.getText(selection).trim();
    const template = (0, material_1.getMaterial)(lowcodeContext.materialPath);
    lowcodeContext?.outputChannel.appendLine(lowcodeContext.materialPath);
    const res = await (0, index_1.translate)({
        schema,
        typeName: 'IOption',
        request: clipboardText || '客户验收状态:1.无需验收、2.待验收、3已验收',
        createChatCompletion: (options) => (0, LLM_1.createChatCompletionShowWebView)({
            messages: options.messages,
            lowcodeContext: lowcodeContext,
            htmlForWebview: getHtmlForWebview(true),
            // llm: 'gemini',
        }),
        tryCount: 3,
    });
    if (res.success) {
        const code = (0, ejs_1.compile)(template.commandPrompt, {
            rawSelectedText: selectText,
            content: JSON.stringify(res.data),
        });
        vscode_1.window.activeTextEditor?.edit((editBuilder) => {
            // editBuilder.replace(activeTextEditor.selection, content);
            if (vscode_1.window.activeTextEditor?.selection.isEmpty) {
                editBuilder.insert(vscode_1.window.activeTextEditor.selection.start, code);
            }
            else {
                editBuilder.replace(new vscode_1.Range(vscode_1.window.activeTextEditor.selection.start, vscode_1.window.activeTextEditor.selection.end), code);
            }
        });
    }
    else {
        vscode_1.window.showErrorMessage(res.message);
    }
}
exports.bootstrap = bootstrap;
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
				<script type="module" crossorigin src="https://lowcode-webview-react-vite.ruoxie.site/js/index.js"></script>
				<link rel="stylesheet" crossorigin href="https://lowcode-webview-react-vite.ruoxie.site/css/index.css">
			</head>
			<body>
				<div id="root"></div>
			</body>
		</html>
`;
};
