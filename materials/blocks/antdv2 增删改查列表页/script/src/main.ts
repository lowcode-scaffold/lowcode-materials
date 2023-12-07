import * as path from 'path';
import * as fs from 'fs-extra';
import { translate } from '../../../../../share/TypeChatSlim/index';
import { context } from './context';
import { PageConfig } from '../../config/schema';

export async function handleAskChatGPT() {
  const { lowcodeContext } = context;
  const schema = fs.readFileSync(
    path.join(lowcodeContext!.materialPath, 'config/schema.ts'),
    'utf8',
  );
  const typeName = 'PageConfig';
  const res = await translate<PageConfig>({
    schema,
    typeName,
    request: JSON.stringify(lowcodeContext!.model as PageConfig),
    completePrompt:
      `你是一个根据以下 TypeScript 类型定义将用户请求转换为 "${typeName}" 类型的 JSON 对象的服务，并且按照字段的注释进行处理:\n` +
      `\`\`\`\n${schema}\`\`\`\n` +
      `以下是用户请求:\n` +
      `"""\n${JSON.stringify(lowcodeContext!.model as PageConfig)}\n"""\n` +
      `The following is the user request translated into a JSON object with 2 spaces of indentation and no properties with the value undefined:\n`,
    createChatCompletion: lowcodeContext!.createChatCompletion,
    showWebview: true,
    extendValidate: (jsonObject) => ({ success: true, data: jsonObject }),
  });
  lowcodeContext!.outputChannel.appendLine(JSON.stringify(res, null, 2));
  if (res.success) {
    return { ...res.data };
  }
  return lowcodeContext!.model;
}
