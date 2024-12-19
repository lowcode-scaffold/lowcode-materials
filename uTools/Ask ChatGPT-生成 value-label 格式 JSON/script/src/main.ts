import path from 'path';
import fs from 'fs';
import { clipboard } from 'electron';
import { validate } from '@share/TypeChatSlim/utools';
import { compile as compileEjs } from '@share/utils/ejs';
import {
  askChatGPT as askOpenai,
  getBlockConfigPath,
  getBlockJsonValidSchema,
} from '@share/utils/uTools';

export const bootstrap = async (scriptFile?: string) => {
  const configPath = getBlockConfigPath(scriptFile!);
  const schema = getBlockJsonValidSchema(scriptFile!);
  const clipboardText =
    (clipboard.readText() || '').trim() ||
    '客户验收状态:1.无需验收、2.待验收、3已验收';
  const typeName = 'IOption';
  const requestPrompt =
    `You are a service that translates user requests into JSON objects of type "${typeName}" according to the following TypeScript definitions:\n` +
    `\`\`\`\n${schema}\`\`\`\n` +
    `The following is a user request:\n` +
    `"""\n${clipboardText}\n"""\n` +
    `The following is the user request translated into a JSON object with 2 spaces of indentation and no properties with the value undefined:\n`;
  const content = await askOpenai({
    messages: [{ role: 'user', content: requestPrompt }],
    handleChunk: () => {},
  });
  const valid = validate(content.content, schema, typeName);
  if (valid.success) {
    const template = fs.readFileSync(
      path.join(configPath, 'template.ejs'),
      'utf8',
    );
    const code = compileEjs(template, {
      rawSelectedText: '请手动修改名称',
      content: JSON.stringify(valid.data),
    } as any);
    utools.outPlugin();
    utools.hideMainWindowPasteText(code);
  } else {
    return valid.message;
  }
};
