import { window, env } from 'vscode';
import { generalBasic } from '@share/BaiduOCR';
import { getClipboardImage } from '@share/utils/clipboardImage';
import { context } from './context';

export async function bootstrap() {
  const { lowcodeContext } = context;
  const clipboardImage = await getClipboardImage(
    lowcodeContext?.env.privateMaterialsPath || '',
  ).catch((ex) => {
    window.showErrorMessage(ex);
  });
  if (!clipboardImage) {
    window.showErrorMessage('剪贴板里没有截图');
  }
  const ocrRes = await generalBasic({ image: clipboardImage! });
  if (ocrRes.words_result.length > 1) {
    const task = ocrRes.words_result[0].words.trim();
    const title = ocrRes.words_result[1].words.trimStart();
    window.showInformationMessage(
      `内容已复制到剪贴板：feat(T${task}): #${task}/${title}`,
    );
    env.clipboard.writeText(`feat(T${task}): #${task}/${title}`);
  } else {
    const result = ocrRes.words_result[0]?.words.trimStart() || '';
    const match = result.match(/^(\d+)(.*)/);
    if (match) {
      const task = match[1]; // 开头的数字部分
      const title = match[2]; // 其余的内容
      window.showInformationMessage(
        `内容已复制到剪贴板：feat(T${task}): #${task}/${title}`,
      );
      env.clipboard.writeText(`feat(T${task}): #${task}/${title}`);
    } else {
      window.showInformationMessage(
        `数据异常：${JSON.stringify(ocrRes, null, 2)}`,
      );
    }
  }
}
