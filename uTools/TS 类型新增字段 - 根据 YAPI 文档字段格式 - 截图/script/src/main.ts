import { AskChatGPT } from '@share/uTools/webviewBaseController';
import { askChatGPT as askOpenai, ocr } from '@share/utils/uTools';
import { clipboard } from 'electron';

export const bootstrap = async (scriptFile?: string) => {
  const availableFormats = clipboard.availableFormats('clipboard');
  if (!availableFormats.some((s) => s.includes('image'))) {
    return '剪贴板里没有截图';
  }
  const base64 = clipboard.readImage('clipboard').toDataURL();
  const ocrRes = await ocr({ base64, model: 'structure_table' });

  if (ocrRes.result?.texts && ocrRes.result.texts[0]) {
    const requestPrompt = `
\`\`\`html
<html>
  <body>
    <table>
      <tbody>
        <tr>
          <td>provinceName</td>
          <td>string</td>
          <td>非必须</td>
          <td>省份</td>
          <td></td>
        </tr>
        <tr>
          <td>provinceCode</td>
          <td>string</td>
          <td>非必须</td>
          <td></td>
          <td>省份编码</td>
        </tr>
        <tr>
          <td>cityName</td>
          <td>string</td>
          <td>非必须</td>
          <td></td>
          <td>城市</td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
\`\`\`

根据上面的内容生成如下 TS 代码

\`\`\`js
/** 省份 */
provinceName: string;
/** 省份编码 */
provinceCode: string;
/** 城市 */
cityName: string;
\`\`\`

按照上面的规则，请根据下面的内容生成代码：

\`\`\`html
${ocrRes.result.texts[0]}
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
  }
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
