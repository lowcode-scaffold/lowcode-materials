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
const vscode_1 = require("vscode");
const fs = __importStar(require("fs-extra"));
const context_1 = require("./context");
const ejs_1 = require("../../../../../share/utils/ejs");
async function bootstrap() {
    const { lowcodeContext } = context_1.context;
    const result = await vscode_1.window.showQuickPick([
        'uniapp/vue3-mvp',
        'uniapp/vue3-mvp emit',
        'uniapp/vue3-mvp props',
        'uniapp/vue3-mvp props emit',
        'uTools 自动化脚本',
    ].map((s) => s), { placeHolder: '请选择模板' });
    if (!result) {
        return;
    }
    const tempWorkPath = path.join(lowcodeContext?.env.rootPath || '', '.lowcode');
    fs.copySync(path.join(lowcodeContext?.materialPath || ''), tempWorkPath);
    await (0, ejs_1.renderEjsTemplates)({
        createBlockPath: path
            .join(lowcodeContext?.explorerSelectedPath || '')
            .replace(/\\/g, '/'),
    }, path.join(tempWorkPath, 'src'));
    fs.copySync(path.join(tempWorkPath, 'src', result), path.join(lowcodeContext?.explorerSelectedPath || ''));
    fs.removeSync(tempWorkPath);
}
exports.bootstrap = bootstrap;
