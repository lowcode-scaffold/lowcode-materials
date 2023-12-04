import fs from 'fs';
import path from 'path';
import { env, window, Range } from 'vscode';
import { translate } from '../../../../../share/TypeChatSlim/index';
import { getMaterial } from '../../../../../share/utils/material';
import { compile as compileEjs } from '../../../../../share/utils/ejs';
import { pasteToEditor } from '../../../../../share/utils/editor';
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
    request: clipboardText,
    createChatCompletion: lowcodeContext!.createChatCompletion,
    showWebview: true,
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
