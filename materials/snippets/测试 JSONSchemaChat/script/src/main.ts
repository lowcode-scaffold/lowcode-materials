import fs from 'fs';
import path from 'path';
import { env, window, Range } from 'vscode';
import { translate } from '@share/JSONSchemaChat/index';
import { context } from './context';

export async function bootstrap() {
  const { lowcodeContext } = context;
  const schema = fs.readFileSync(
    path.join(lowcodeContext!.materialPath, 'config/validSchema.json'),
    'utf8',
  );
  const clipboardText = await env.clipboard.readText();
  const { selection, document } = window.activeTextEditor!;
  const selectText = document.getText(selection).trim();
  const res = await translate({
    schema,
    request: selectText || clipboardText,
    createChatCompletion: lowcodeContext!.createChatCompletion,
    showWebview: true,
  });
  if (res.success) {
    window.activeTextEditor?.edit((editBuilder) => {
      // editBuilder.replace(activeTextEditor.selection, content);
      if (window.activeTextEditor?.selection.isEmpty) {
        editBuilder.insert(
          window.activeTextEditor.selection.start,
          JSON.stringify(res.data),
        );
      } else {
        editBuilder.replace(
          new Range(
            window.activeTextEditor!.selection.start,
            window.activeTextEditor!.selection.end,
          ),
          JSON.stringify(res.data),
        );
      }
    });
  } else {
    window.showErrorMessage(res.message);
  }
}
