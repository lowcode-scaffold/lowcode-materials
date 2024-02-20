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
exports.getConfig = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const vscode_1 = require("vscode");
const file_1 = require("./file");
const defaultConfig = {
    yapi: { projects: [] },
    mock: { mockKeyWordEqual: [], mockKeyWordLike: [] },
    commonlyUsedBlock: [],
};
const getConfig = () => {
    let config = {};
    if (fs.existsSync(path.join(vscode_1.workspace.rootPath || '', '.lowcoderc'))) {
        config = JSON.parse((0, file_1.getFileContent)('.lowcoderc') || '{}');
        config.yapi?.projects?.forEach((s) => {
            s.domain = s.domain || config.yapi?.domain || '';
        });
    }
    return { ...defaultConfig, ...config };
};
exports.getConfig = getConfig;
