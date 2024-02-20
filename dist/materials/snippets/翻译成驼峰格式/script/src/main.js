"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = void 0;
const vscode_1 = require("vscode");
const context_1 = require("./context");
async function bootstrap() {
    const clipboardText = await vscode_1.env.clipboard.readText();
    const { selection, document } = vscode_1.window.activeTextEditor;
    const selectText = document.getText(selection).trim();
    let content = await context_1.context.lowcodeContext.createChatCompletion({
        messages: [
            {
                role: 'system',
                content: `你是一个翻译家，你的目标是把中文翻译成英文单词，请翻译时使用驼峰格式，小写字母开头，不要带翻译腔，而是要翻译得自然、流畅和地道，使用优美和高雅的表达方式。请翻译下面用户输入的内容`,
            },
            {
                role: 'user',
                content: selectText || clipboardText,
            },
        ],
    });
    content = content.charAt(0).toLowerCase() + content.slice(1);
    vscode_1.window.activeTextEditor?.edit((editBuilder) => {
        if (vscode_1.window.activeTextEditor?.selection.isEmpty) {
            editBuilder.insert(vscode_1.window.activeTextEditor.selection.start, content);
        }
        else {
            editBuilder.replace(new vscode_1.Range(vscode_1.window.activeTextEditor.selection.start, vscode_1.window.activeTextEditor.selection.end), content);
        }
    });
}
exports.bootstrap = bootstrap;
