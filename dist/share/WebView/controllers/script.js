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
exports.runScript = void 0;
/* eslint-disable no-eval */
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const runScript = async (message, context) => {
    const scriptFile = path.join(message.data.materialPath, 'script/index.js');
    if (fs.existsSync(scriptFile)) {
        delete eval('require').cache[eval('require').resolve(scriptFile)];
        const script = eval('require')(scriptFile);
        if (script[message.data.script]) {
            const c = {
                ...context,
                params: message.data.params,
                materialPath: message.data.materialPath,
            };
            const scriptRes = await script[message.data.script](c);
            return scriptRes;
        }
        throw new Error(`方法: ${message.data.script} 不存在`);
    }
    else {
        throw new Error(`脚本文件不存在`);
    }
};
exports.runScript = runScript;
