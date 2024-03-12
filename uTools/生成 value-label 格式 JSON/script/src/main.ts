import path from 'path';
import fs from 'fs';
import { clipboard } from 'electron';

export const bootstrap = async (scriptFile?: string) => {
  const configPath = path.join(
    scriptFile!.replace('/script/src/main', '').replace('dist/', ''),
    'config',
  );
  const schema = fs.readFileSync(path.join(configPath, 'schema.ts'), 'utf8');
  const clipboardText = clipboard.readText();
  const typeName = 'IOption';
  const requestPrompt =
    `You are a service that translates user requests into JSON objects of type "${typeName}" according to the following TypeScript definitions:\n` +
    `\`\`\`\n${schema}\`\`\`\n` +
    `The following is a user request:\n` +
    `"""\n${clipboardText}\n"""\n` +
    `The following is the user request translated into a JSON object with 2 spaces of indentation and no properties with the value undefined:\n`;
  clipboard.writeText(requestPrompt);
  utools.showNotification('prompt 已经写入剪贴板');
  return requestPrompt;
};
