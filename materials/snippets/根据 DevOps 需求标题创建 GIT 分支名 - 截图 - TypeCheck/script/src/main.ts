import path from 'path';
import { window, env } from 'vscode';
import * as fs from 'fs-extra';
import { generalBasic } from '@share/BaiduOCR';
import { validate } from '@share/TypeChatSlim';
import { getClipboardImage } from '@share/utils/clipboardImage';
import { context } from './context';

export async function bootstrap() {
  const { lowcodeContext } = context;
  const clipboardImage = await getClipboardImage(
    lowcodeContext?.env.privateMaterialsPath || '',
  ).catch((ex) => {
    window.showErrorMessage(ex);
  });
  if (!clipboardImage) {
    window.showErrorMessage('剪贴板里没有截图');
  }
  const ocrRes = await generalBasic({ image: clipboardImage! });
  const words = ocrRes.words_result.map((s) => s.words).join(' ');
  const schema = fs.readFileSync(
    path.join(lowcodeContext!.materialPath, 'config/schema.ts'),
    'utf8',
  );
  const typeName = 'TaskInfo';
  const requestPrompt = `
You are a service that translates user requests into JSON objects of type "${typeName}" according to the following TypeScript definitions:
\`\`\`ts
${schema}
\`\`\`
The following is a user request:
\`\`\`
${words}
\`\`\`
The following is the user request translated into a JSON object with 2 spaces of indentation and no properties with the value undefined:
`;
  const content = await context.lowcodeContext!.createChatCompletion({
    messages: [
      {
        role: 'user',
        content: requestPrompt,
      },
    ],
    showWebview: true,
    handleChunk: (chunck) => {},
  });
  const valid = validate<{ taskId: string; taskTitle: string }>(
    content,
    schema,
    typeName,
  );
  if (valid.success) {
    const branchName = `feat/T${valid.data.taskId}_${valid.data.taskTitle}`;
    env.clipboard.writeText(branchName);
    window.showInformationMessage(`分支名已复制到剪贴板：${branchName}`);
  } else {
    window.showErrorMessage(`JSON 校验失败：${valid.message}`);
  }
}
