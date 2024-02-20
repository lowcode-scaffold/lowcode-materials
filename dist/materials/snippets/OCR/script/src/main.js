"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = void 0;
const vscode_1 = require("vscode");
const index_1 = require("../../../../../share/BaiduOCR/index");
const context_1 = require("./context");
async function bootstrap() {
    const { lowcodeContext } = context_1.context;
    const clipboardImage = await lowcodeContext?.getClipboardImage();
    const ocrRes = await (0, index_1.generalBasic)({ image: clipboardImage });
    const words = ocrRes.words_result.map((s) => s.words).join(',');
    vscode_1.env.clipboard.writeText(words).then(() => {
        vscode_1.window.showInformationMessage('内容已经复制到剪贴板');
    });
    vscode_1.window.activeTextEditor?.edit((editBuilder) => {
        // editBuilder.replace(activeTextEditor.selection, content);
        if (vscode_1.window.activeTextEditor?.selection.isEmpty) {
            editBuilder.insert(vscode_1.window.activeTextEditor.selection.start, words);
        }
        else {
            editBuilder.replace(new vscode_1.Range(vscode_1.window.activeTextEditor.selection.start, vscode_1.window.activeTextEditor.selection.end), words);
        }
    });
}
exports.bootstrap = bootstrap;
