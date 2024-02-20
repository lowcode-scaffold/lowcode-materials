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
                content: `你是一个代码专家，你的目标是把 JSON 数据转换成 TypeScript 类型，严格按照以下要求进行处理：类型名称根据每个字段意思推测出来；类型声明使用 type 关键字；把中文字段翻译成英文；将原来的中文作为字段的注释，注释是中文，而且注释使用 jsdoc 的格式；请翻译时使用驼峰格式，小写字母开头，不要带翻译腔，而是要翻译得自然、流畅和地道，使用优美和高雅的表达方式。请处理下面用户输入的内容`,
            },
            {
                role: 'user',
                content: selectText || clipboardText,
            },
        ],
    });
    content = content.replace('```typescript', '').replace('```', '');
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
