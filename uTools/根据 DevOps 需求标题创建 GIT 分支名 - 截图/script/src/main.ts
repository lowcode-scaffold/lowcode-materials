/* eslint-disable prefer-destructuring */
import { LLMMessage } from '@share/uTools/webviewBaseController';
import { askChatGPT as askOpenai, ocr } from '@share/utils/uTools';
import { clipboard } from 'electron';

export const bootstrap = async (scriptFile?: string) => {
  const availableFormats = clipboard.availableFormats('clipboard');
  if (!availableFormats.some((s) => s.includes('image'))) {
    return '剪贴板里没有截图';
  }
  const base64 = clipboard.readImage('clipboard').toDataURL();
  const ocrRes = await ocr({ base64, model: 'ocr_system' });
  let task = '';
  let title = '';
  if (ocrRes.result?.texts && ocrRes.result.texts.length > 1) {
    task = ocrRes.result.texts[0].trim();
    title = ocrRes.result.texts[1].trimStart();
  } else {
    const result = ocrRes.result?.texts?.[0]?.trimStart() || '';
    const match = result.match(/^(\d+)(.*)/);
    if (match) {
      task = match[1]; // 开头的数字部分
      title = match[2]; // 其余的内容
    }
  }
  if (title) {
    const requestPrompt = `
下面是一个需求的简要索说明，需要根据这个说明创建 git 分支，请给出英文分支名，不要直接翻译，要自然、流畅和地道，不要加 feature、feat 等分支特性，用户自己处理

\`\`\`
${title}
\`\`\`
`;
    // const content = await askOpenai({
    //   messages: [{ role: 'user', content: requestPrompt }],
    //   handleChunk: () => {},
    // });
    // return `feat/T${task}_${content.content}`;

    utools.redirect(['lowcode', 'lowcode'], {
      type: 'text',
      data: JSON.stringify({
        scriptFile,
        route: '/chat',
        content: requestPrompt,
        form: {
          task,
        },
      }),
    });
    return;
  }
  return JSON.stringify(ocrRes);
};

// 给页面调用的
export const askChatGPT = async (data: {
  messages: LLMMessage;
  handleChunk: (chunck: string) => void;
  model: {
    task: string;
  };
}) => {
  const res = await askOpenai({ ...data, model: undefined });
  data.handleChunk(`
	
完整分支名：
\`\`\`
feat/T${data.model.task}_${res.content.replace(/```/g, '').replace(/`/g, '')}
\`\`\`		
`);
  return res;
};
