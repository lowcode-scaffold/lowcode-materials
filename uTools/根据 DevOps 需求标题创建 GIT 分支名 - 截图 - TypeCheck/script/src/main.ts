/* eslint-disable prefer-destructuring */
import { validate } from '@share/TypeChatSlim/utools';
import { LLMMessage } from '@share/uTools/webviewBaseController';
import {
  askChatGPT as askOpenai,
  getBlockJsonValidSchema,
  ocr,
} from '@share/utils/uTools';
import { clipboard } from 'electron';

export const bootstrap = async (scriptFile?: string) => {
  const availableFormats = clipboard.availableFormats('clipboard');
  if (!availableFormats.some((s) => s.includes('image'))) {
    return '剪贴板里没有截图';
  }
  const base64 = clipboard.readImage('clipboard').toDataURL();
  const ocrRes = await ocr({ base64, model: 'ocr_system' });
  const schema = getBlockJsonValidSchema(scriptFile!);
  const text = ocrRes.result?.texts?.join(' ') || '';
  const typeName = 'TaskInfo';
  const requestPrompt = `
You are a service that translates user requests into JSON objects of type "${typeName}" according to the following TypeScript definitions:
\`\`\`ts
${schema}
\`\`\`
The following is a user request:
\`\`\`
${text}
\`\`\`
The following is the user request translated into a JSON object with 2 spaces of indentation and no properties with the value undefined:
`;
  utools.redirect(['lowcode', 'lowcode'], {
    type: 'text',
    data: JSON.stringify({
      scriptFile,
      route: '/chat',
      content: requestPrompt,
    }),
  });
};

// 给页面调用的
export const askChatGPT = async (data: {
  messages: LLMMessage;
  handleChunk: (chunck: string) => void;
  scriptFile: string;
}) => {
  const schema = getBlockJsonValidSchema(data.scriptFile);
  const typeName = 'TaskInfo';
  const content = await askOpenai({
    messages: data.messages,
    handleChunk: data.handleChunk,
  });
  const valid = validate<{ taskId: string; taskTitle: string }>(
    content.content,
    schema,
    typeName,
  );
  if (valid.success) {
    data.handleChunk(`

完整分支名：
\`\`\`
feat/T${valid.data.taskId}_${valid.data.taskTitle
      .replace(/```/g, '')
      .replace(/`/g, '')}
\`\`\`
`);
  } else {
    data.handleChunk(`

> JSON 校验不通过

${valid.message}
`);
  }
  return content;
};
