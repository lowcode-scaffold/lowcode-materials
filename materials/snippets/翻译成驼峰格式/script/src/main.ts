import { env, window, Range } from 'vscode';
import { context } from './context';

export async function bootstrap() {
  const clipboardText = await env.clipboard.readText();
  const { selection, document } = window.activeTextEditor!;
  const selectText = document.getText(selection).trim();
  let content = await context.lowcodeContext!.createChatCompletion({
    messages: [
      {
        role: 'system',
        content: `你是一个翻译家，你的目标是把中文翻译成英文单词，请翻译时使用驼峰格式，小写字母开头，不要带翻译腔，而是要翻译得自然、流畅和地道，使用优美和高雅的表达方式。请翻译下面用户输入的内容`,
      },
      {
        role: 'user',
        content: selectText || clipboardText,
      },
    ],
  });
  content = content.charAt(0).toLowerCase() + content.slice(1);
  window.activeTextEditor?.edit((editBuilder) => {
    if (window.activeTextEditor?.selection.isEmpty) {
      editBuilder.insert(window.activeTextEditor.selection.start, content);
    } else {
      editBuilder.replace(
        new Range(
          window.activeTextEditor!.selection.start,
          window.activeTextEditor!.selection.end,
        ),
        content,
      );
    }
  });
}
