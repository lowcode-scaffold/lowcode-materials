import { ocr } from '@share/utils/uTools';
import { clipboard } from 'electron';

export const bootstrap = async (scriptFile?: string) => {
  const availableFormats = clipboard.availableFormats('clipboard');
  if (!availableFormats.some((s) => s.includes('image'))) {
    return '剪贴板里没有截图';
  }
  const base64 = clipboard.readImage('clipboard').toDataURL();
  const ocrRes = await ocr({ base64, model: 'ocr_system' });
  if (ocrRes.result?.texts && ocrRes.result.texts.length > 1) {
    const task = ocrRes.result.texts[0].trim();
    const title = ocrRes.result.texts[1].trimStart();
    utools.outPlugin();
    utools.hideMainWindowPasteText(`feat(T${task}): #${task}/${title}`);
  } else {
    const result = ocrRes.result?.texts?.[0]?.trimStart() || '';
    const match = result.match(/^(\d+)(.*)/);
    if (match) {
      const task = match[1]; // 开头的数字部分
      const title = match[2]; // 其余的内容
      utools.outPlugin();
      utools.hideMainWindowPasteText(`feat(T${task}): #${task}/${title}`);
    } else {
      return result;
    }
  }
};
