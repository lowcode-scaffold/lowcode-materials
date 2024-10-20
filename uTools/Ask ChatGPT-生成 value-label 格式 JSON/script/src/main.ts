import path from 'path';
import fs from 'fs';
import { clipboard } from 'electron';
import { translate } from '@share/TypeChatSlim/utools';
import { askChatGPT as askOpenai } from '@share/utils/uTools';

export const bootstrap = async (scriptFile?: string) => {
  const configPath = path.join(
    scriptFile!
      .replace('/script/src/mainBundle', '/config')
      .replace('/script/src/main', '/config'),
  );
  const schema = fs.readFileSync(path.join(configPath, 'schema.ts'), 'utf8');
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
  utools.redirect(['lowcode', 'lowcode'], {
    type: 'text',
    data: JSON.stringify({
      scriptFile,
      route: '/chat',
      content: requestPrompt,
    }),
  });
};

type LLMMessage = (
  | {
      role: 'system';
      content: string;
    }
  | {
      role: 'user';
      content:
        | string
        | (
            | {
                type: 'image_url';
                image_url: { url: string };
              }
            | { type: 'text'; text: string }
          )[];
    }
)[];

// 给页面调用的
export const askChatGPT = async (data: {
  messages: LLMMessage;
  handleChunk: (chunck: string) => void;
  scriptFile: string;
}) => {
  const content = await askOpenai({
    messages: data.messages,
    handleChunk: data.handleChunk,
  });
  return content;
  // const configPath = path.join(
  //   data.scriptFile
  //     .replace('/script/src/mainBundle', '/config')
  //     .replace('/script/src/main', '/config'),
  // );
  // const schema = fs.readFileSync(path.join(configPath, 'schema.ts'), 'utf8');
  // const res = await translate({
  //   schema,
  //   typeName: 'IOption',
  //   scriptFile: data.scriptFile,
  //   request: '',
  //   showWebview: true,
  //   async createChatCompletion(options) {
  //     const content = await askOpenai({
  //       messages: data.messages,
  //       handleChunk: data.handleChunk,
  //     });
  //     return content.content;
  //   },
  // });
  // return { content: res.responseText };
};
