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
        content: `你是一个代码专家，你的目标是把 JSON 数据转换成 TypeScript 类型，类型名称根据每个字段意思推测出来，类型生命使用 type 关键字，并且要把中文字段翻译成英文，并且将原来的中文作为字段的注释，注意注释是中文，而且注释使用 jsdoc 的格式，请翻译时使用驼峰格式，小写字母开头，不要带翻译腔，而是要翻译得自然、流畅和地道，使用优美和高雅的表达方式。请处理下面用户输入的内容`,
      },
      {
        role: 'user',
        content: selectText || clipboardText,
      },
    ],
  });
  content = content.replace('```typescript', '').replace('```', '');
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
