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
  const configPath = getBlockConfigPath(data.scriptFile);
  const schema = getBlockJsonValidSchema(data.scriptFile);
  const template = fs.readFileSync(
    path.join(configPath, 'template.ejs'),
    'utf8',
  );
  const typeName = 'IOption';

  if (
    data.messages.length >= 3 &&
    (data.messages[data.messages.length - 1].content as string).includes('>>>')
  ) {
    const name = (data.messages[data.messages.length - 1].content as string)
      .split('>>>')[1]
      .trim();
    const jsonValid = validate(
      data.messages[data.messages.length - 2].content as string,
      schema,
      typeName,
    );
    if (jsonValid.success) {
      setTimeout(() => {
        const code = compileEjs(template, {
          rawSelectedText: name || '请手动修改名称',
          content: JSON.stringify(jsonValid.data),
        } as any);
        clipboard.writeText(code);
        utools.outPlugin();
        utools.hideMainWindowPasteText(code);
      }, 300);
    } else {
      data.handleChunk(`

> 生成代码时 JSON 校验不通过

${jsonValid.message}
						`);
    }
    return '';
  }
  const content = await askOpenai({
    messages: data.messages,
    handleChunk: data.handleChunk,
  });
  const valid = validate(content.content, schema, typeName);
  if (valid.success) {
    data.handleChunk(`

JSON 校验通过，输入\`>>>\`生成代码
			`);
  } else {
    data.handleChunk(`

> JSON 校验不通过

${valid.message}
						`);
  }
  return content;
};
