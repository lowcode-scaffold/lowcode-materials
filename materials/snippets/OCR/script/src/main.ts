import { window, Range } from 'vscode';
import { generalBasic } from '../../../../../share/BaiduOCR/index';
import { context } from './context';

export async function bootstrap() {
  const { lowcodeContext } = context;
  const clipboardImage = await lowcodeContext?.getClipboardImage();
  const ocrRes = await generalBasic({ image: clipboardImage! });
  const words = ocrRes.words_result.map((s) => s.words).join(',');
  window.activeTextEditor?.edit((editBuilder) => {
    // editBuilder.replace(activeTextEditor.selection, content);
    if (window.activeTextEditor?.selection.isEmpty) {
      editBuilder.insert(window.activeTextEditor.selection.start, words);
    } else {
      editBuilder.replace(
        new Range(
          window.activeTextEditor!.selection.start,
          window.activeTextEditor!.selection.end,
        ),
        words,
      );
    }
  });
}
