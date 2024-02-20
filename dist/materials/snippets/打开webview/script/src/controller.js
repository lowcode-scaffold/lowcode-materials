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
exports.askChatGPT = exports.askGemini = exports.getMaterialPath = void 0;
const vscode = __importStar(require("vscode"));
const gemini_1 = require("../../../../../share/LLM/gemini");
const openai_1 = require("../../../../../share/LLM/openai");
const callback_1 = require("../../../../../share/WebView/callback");
const API_KEY = 'lowcode.GeminiKey';
const getMaterialPath = async (message, context) => context.materialPath;
exports.getMaterialPath = getMaterialPath;
const askGemini = async (message, lowcodeContext) => {
    const context = lowcodeContext.env.extensionContext;
    // await context.secrets.delete(API_KEY); // 需要更新 API KEY 的时候打开
    let apiKey = await context.secrets.get(API_KEY);
    if (!apiKey) {
        vscode.window.showWarningMessage('Enter your API KEY to save it securely.');
        apiKey = await setApiKey(context);
        if (!apiKey) {
            (0, callback_1.invokeLLMChunkCallback)(lowcodeContext.webview, message.cbid, {
                content: 'Please enter your api key',
            });
            return {
                content: 'Please enter your api key',
            };
        }
    }
    const res = await (0, gemini_1.createChatCompletion)({
        model: message.data.messages.some((s) => Array.isArray(s.content) &&
            s.content.some((c) => c.type === 'image_url'))
            ? 'gemini-pro-vision'
            : 'gemini-pro',
        apiKey,
        messages: message.data.messages,
        handleChunk: (data) => {
            (0, callback_1.invokeLLMChunkCallback)(lowcodeContext.webview, message.cbid, {
                content: data.text,
            });
        },
        proxyUrl: 'http://127.0.0.1:7890',
    });
    return {
        content: res,
    };
};
exports.askGemini = askGemini;
const askChatGPT = async (message, lowcodeContext) => {
    const res = await (0, openai_1.createChatCompletion)({
        model: message.data.messages.some((s) => Array.isArray(s.content) &&
            s.content.some((c) => c.type === 'image_url'))
            ? 'gpt-4-vision-preview'
            : undefined,
        messages: message.data.messages,
        handleChunk: (data) => {
            (0, callback_1.invokeLLMChunkCallback)(lowcodeContext.webview, message.cbid, {
                content: data.text,
            });
        },
    });
    return {
        content: res,
    };
};
exports.askChatGPT = askChatGPT;
async function setApiKey(context) {
    const apiKey = await vscode.window.showInputBox({
        title: 'Enter your API KEY',
        password: true,
        placeHolder: '**************************************',
        ignoreFocusOut: true,
    });
    if (!apiKey) {
        vscode.window.showWarningMessage('Empty value');
        return;
    }
    await context.secrets.store(API_KEY, apiKey);
    return apiKey;
}
