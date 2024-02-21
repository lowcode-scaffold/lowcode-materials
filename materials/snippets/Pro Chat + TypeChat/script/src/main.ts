import fs from 'fs';
import path from 'path';
import { env, window, Range } from 'vscode';
import { createChatCompletionShowWebView } from '../../../../../share/LLM';
import { translate } from '../../../../../share/TypeChatSlim/index';
import { getMaterial } from '../../../../../share/utils/material';
import { compile as compileEjs } from '../../../../../share/utils/ejs';
import { context } from './context';

export async function bootstrap() {
  const { lowcodeContext } = context;
  const schema = fs.readFileSync(
    path.join(lowcodeContext!.materialPath, 'config/schema.ts'),
    'utf8',
  );
  const clipboardText = await env.clipboard.readText();
  const { selection, document } = window.activeTextEditor!;
  const selectText = document.getText(selection).trim();
  const template = getMaterial(lowcodeContext!.materialPath);
  lowcodeContext?.outputChannel.appendLine(lowcodeContext!.materialPath);
  const res = await translate({
    schema,
    typeName: 'IOption',
    request: clipboardText || '客户验收状态:1.无需验收、2.待验收、3已验收',
    createChatCompletion: (options: {
      messages: any;
      handleChunk?: ((data: { text?: string | undefined }) => void) | undefined;
    }) =>
      createChatCompletionShowWebView({
        messages: options.messages,
        lowcodeContext: lowcodeContext!,
        htmlForWebview: getHtmlForWebview(true),
        // llm: 'gemini',
      }),
    tryCount: 3,
  });
  if (res.success) {
    const code = compileEjs(template!.commandPrompt, {
      rawSelectedText: selectText,
      content: JSON.stringify(res.data),
    } as any);
    window.activeTextEditor?.edit((editBuilder) => {
      // editBuilder.replace(activeTextEditor.selection, content);
      if (window.activeTextEditor?.selection.isEmpty) {
        editBuilder.insert(window.activeTextEditor.selection.start, code);
      } else {
        editBuilder.replace(
          new Range(
            window.activeTextEditor!.selection.start,
            window.activeTextEditor!.selection.end,
          ),
          code,
        );
      }
    });
  } else {
    window.showErrorMessage(res.message);
  }
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
				<script type="module" crossorigin src="https://lowcode-webview-react-vite.ruoxie.site/js/index.js"></script>
				<link rel="stylesheet" crossorigin href="https://lowcode-webview-react-vite.ruoxie.site/css/index.css">
			</head>
			<body>
				<div id="root"></div>
			</body>
		</html>
`;
};
