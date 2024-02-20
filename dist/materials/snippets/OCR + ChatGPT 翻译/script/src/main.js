"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const vscode_1 = require("vscode");
const index_1 = require("../../../../../share/BaiduOCR/index");
const index_2 = require("../../../../../share/TypeChatSlim/index");
const context_1 = require("./context");
async function bootstrap() {
    const { lowcodeContext } = context_1.context;
    const clipboardImage = await lowcodeContext?.getClipboardImage();
    const ocrRes = await (0, index_1.generalBasic)({ image: clipboardImage });
    const columns = ocrRes.words_result.map((s) => ({
        title: s.words,
        dataIndex: s.words,
        key: s.words,
        slots: {
            customRender: s.words,
        },
    }));
    const schema = fs.readFileSync(path.join(lowcodeContext.materialPath, 'config/schema.ts'), 'utf8');
    const typeName = 'IColumns';
    const res = await (0, index_2.translate)({
        schema,
        typeName,
        request: JSON.stringify(columns),
        completePrompt: `你是一个根据以下 TypeScript 类型定义将用户请求转换为 "${typeName}" 类型的 JSON 对象的服务，并且按照字段的注释进行处理:\n` +
            `\`\`\`\n${schema}\`\`\`\n` +
            `以下是用户请求:\n` +
            `"""\n${JSON.stringify(columns)}\n"""\n` +
            `The following is the user request translated into a JSON object with 2 spaces of indentation and no properties with the value undefined:\n`,
        createChatCompletion: lowcodeContext.createChatCompletion,
        showWebview: true,
        extendValidate: (jsonObject) => ({ success: true, data: jsonObject }),
    });
    let insertText = '';
    if (res.success) {
        insertText = JSON.stringify(res.data, null, 2);
    }
    else {
        insertText = JSON.stringify(res, null, 2);
    }
    vscode_1.window.activeTextEditor?.edit((editBuilder) => {
        // editBuilder.replace(activeTextEditor.selection, content);
        if (lowcodeContext?.activeTextEditor?.selection.isEmpty) {
            editBuilder.insert(vscode_1.window.activeTextEditor.selection.start, insertText);
        }
        else {
            editBuilder.replace(new vscode_1.Range(vscode_1.window.activeTextEditor.selection.start, vscode_1.window.activeTextEditor.selection.end), insertText);
        }
    });
}
exports.bootstrap = bootstrap;
