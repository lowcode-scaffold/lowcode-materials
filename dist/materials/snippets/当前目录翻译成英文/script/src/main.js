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
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs-extra"));
const context_1 = require("./context");
async function bootstrap() {
    const { lowcodeContext } = context_1.context;
    const explorerSelectedPath = path
        .join(lowcodeContext?.explorerSelectedPath || '')
        .replace(/\\/g, '/');
    const explorerSelectedPathArr = explorerSelectedPath.split('/');
    const name = explorerSelectedPathArr.pop();
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
    }, async (progress) => {
        progress.report({
            message: `loading`,
        });
        let content = await context_1.context.lowcodeContext.createChatCompletion({
            messages: [
                {
                    role: 'system',
                    content: `你是一个翻译家，你的目标是把中文翻译成英文单词，请翻译时使用驼峰格式，小写字母开头，不要带翻译腔，而是要翻译得自然、流畅和地道，使用优美和高雅的表达方式。请翻译下面用户输入的内容`,
                },
                {
                    role: 'user',
                    content: name || '',
                },
            ],
        });
        content = content.charAt(0).toLowerCase() + content.slice(1);
        fs.renameSync(path.join(lowcodeContext?.explorerSelectedPath || ''), path.join(explorerSelectedPathArr.join('/'), content));
    });
}
exports.bootstrap = bootstrap;
