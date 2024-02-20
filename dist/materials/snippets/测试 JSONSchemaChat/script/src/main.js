"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const vscode_1 = require("vscode");
const index_1 = require("../../../../../share/JSONSchemaChat/index");
const context_1 = require("./context");
async function bootstrap() {
    const { lowcodeContext } = context_1.context;
    const schema = fs_1.default.readFileSync(path_1.default.join(lowcodeContext.materialPath, 'config/validSchema.json'), 'utf8');
    const clipboardText = await vscode_1.env.clipboard.readText();
    const { selection, document } = vscode_1.window.activeTextEditor;
    const selectText = document.getText(selection).trim();
    const res = await (0, index_1.translate)({
        schema,
        request: selectText || clipboardText,
        createChatCompletion: lowcodeContext.createChatCompletion,
        showWebview: true,
    });
    if (res.success) {
        vscode_1.window.activeTextEditor?.edit((editBuilder) => {
            // editBuilder.replace(activeTextEditor.selection, content);
            if (vscode_1.window.activeTextEditor?.selection.isEmpty) {
                editBuilder.insert(vscode_1.window.activeTextEditor.selection.start, JSON.stringify(res.data));
            }
            else {
                editBuilder.replace(new vscode_1.Range(vscode_1.window.activeTextEditor.selection.start, vscode_1.window.activeTextEditor.selection.end), JSON.stringify(res.data));
            }
        });
    }
    else {
        vscode_1.window.showErrorMessage(res.message);
    }
}
exports.bootstrap = bootstrap;
