import { askChatGPT as askOpenai } from '@share/utils/uTools';
import { AskChatGPT } from '@share/uTools/webviewBaseController';
import { clipboard } from 'electron';

export const bootstrap = async (scriptFile?: string) => {
  const clipboardText = clipboard.readText() || '';
  if (!clipboardText) {
    return '请复制内容';
  }
  const requestPrompt = `
\`\`\`
dateType
integer
非必须
日期类型 0~录入时间、1~成交时间、2~结案时间、3~申佣时间
\`\`\`

根据上面的内容生成如下 TS 代码

\`\`\`js
/** 日期类型 0~录入时间、1~成交时间、2~结案时间、3~申佣时间 */
dateType: number;
\`\`\`

按照上面的规则，请根据下面的内容生成代码：

\`\`\`
${clipboardText
  .split(/\t|\n/)
  .filter((s) => s)
  .join('\n')}
\`\`\`  
`;
  // const content = await askOpenai({
  //   messages: [{ role: 'user', content: requestPrompt }],
  //   handleChunk: () => {},
  // });
  // utools.outPlugin();
  // utools.hideMainWindowPasteText(
  //   content.content.replace(/```js/g, '').replace(/```/g, ''),
  // );
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
export const askChatGPT: AskChatGPT = async (data) => {
  const res = await askOpenai({ ...data, model: undefined });
  setTimeout(() => {
    utools.outPlugin();
    utools.hideMainWindowPasteText(
      res.content.replace(/```js/g, '').replace(/```/g, ''),
    );
  }, 2000);
  return res;
};
