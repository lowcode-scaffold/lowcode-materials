import * as path from 'path';
import * as fs from 'fs-extra';
import { window, Range } from 'vscode';
import { generalBasic } from '@share/BaiduOCR/index';
import { translate } from '@share/TypeChatSlim/index';
import { context } from './context';
import { IColumns } from '../../config/schema';

export async function bootstrap() {
  const { lowcodeContext } = context;
  const clipboardImage = await lowcodeContext?.getClipboardImage();
  const ocrRes = await generalBasic({ image: clipboardImage! });
  const columns = ocrRes.words_result.map((s) => ({
    title: s.words,
    dataIndex: s.words,
    key: s.words,
    slots: {
      customRender: s.words,
    },
  }));
  const schema = fs.readFileSync(
    path.join(lowcodeContext!.materialPath, 'config/schema.ts'),
    'utf8',
  );
  const typeName = 'IColumns';
  const res = await translate<IColumns>({
    schema,
    typeName,
    request: JSON.stringify(columns),
    completePrompt:
      `你是一个根据以下 TypeScript 类型定义将用户请求转换为 "${typeName}" 类型的 JSON 对象的服务，并且按照字段的注释进行处理:\n` +
      `\`\`\`\n${schema}\`\`\`\n` +
      `以下是用户请求:\n` +
      `"""\n${JSON.stringify(columns)}\n"""\n` +
      `The following is the user request translated into a JSON object with 2 spaces of indentation and no properties with the value undefined:\n`,
    createChatCompletion: lowcodeContext!.createChatCompletion,
    showWebview: true,
    extendValidate: (jsonObject) => ({ success: true, data: jsonObject }),
  });
  let insertText = '';
  if (res.success) {
    insertText = JSON.stringify(res.data, null, 2);
  } else {
    insertText = JSON.stringify(res, null, 2);
  }
  window.activeTextEditor?.edit((editBuilder) => {
    // editBuilder.replace(activeTextEditor.selection, content);
    if (lowcodeContext?.activeTextEditor?.selection.isEmpty) {
      editBuilder.insert(window.activeTextEditor!.selection.start, insertText);
    } else {
      editBuilder.replace(
        new Range(
          window.activeTextEditor!.selection.start,
          window.activeTextEditor!.selection.end,
        ),
        insertText,
      );
    }
  });
}
