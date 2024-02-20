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
exports.createChatCompletionShowWebView = exports.createChatCompletion = void 0;
const vscode = __importStar(require("vscode"));
const WebView_1 = require("../WebView");
const emitter_1 = require("../utils/emitter");
const gemini = __importStar(require("./gemini"));
const geminiProxy = __importStar(require("./geminiProxy"));
const openai = __importStar(require("./openai"));
const API_KEY = 'lowcode.GeminiKey';
const createChatCompletion = async (options) => {
    if (options.llm === 'gemini') {
        const context = options.lowcodeContext.env.extensionContext;
        // await context.secrets.delete(API_KEY); // 需要更新 API KEY 的时候打开
        let apiKey = await context.secrets.get(API_KEY);
        if (!apiKey) {
            vscode.window.showWarningMessage('Enter your API KEY to save it securely.');
            apiKey = await setApiKey(context);
            if (!apiKey) {
                if (options.handleChunk) {
                    options.handleChunk({ text: 'Please enter your api key' });
                }
                return 'Please enter your api key';
            }
        }
        const res = await gemini.createChatCompletion({
            messages: options.messages,
            model: options.messages.some((s) => Array.isArray(s.content) &&
                s.content.some((c) => c.type === 'image_url'))
                ? 'gemini-pro-vision'
                : 'gemini-pro',
            apiKey,
            handleChunk(data) {
                if (options.handleChunk) {
                    options.handleChunk(data);
                    emitter_1.emitter.emit('chatGPTChunck', data);
                }
            },
            proxyUrl: 'http://127.0.0.1:7890',
        });
        emitter_1.emitter.emit('chatGPTComplete', res);
        return res;
    }
    if (options.llm === 'geminiProxy') {
        const res = await geminiProxy.createChatCompletion({
            messages: options.messages,
            model: options.messages.some((s) => Array.isArray(s.content) &&
                s.content.some((c) => c.type === 'image_url'))
                ? 'gemini-pro-vision'
                : 'gemini-pro',
            maxTokens: 4096,
            handleChunk(data) {
                if (options.handleChunk) {
                    options.handleChunk(data);
                    emitter_1.emitter.emit('chatGPTChunck', data);
                }
            },
        });
        emitter_1.emitter.emit('chatGPTComplete', res);
        return res;
    }
    const res = await openai.createChatCompletion({
        messages: options.messages,
        handleChunk(data) {
            if (options.handleChunk) {
                options.handleChunk(data);
                emitter_1.emitter.emit('chatGPTChunck', data);
            }
        },
    });
    emitter_1.emitter.emit('chatGPTComplete', res);
    return res;
};
exports.createChatCompletion = createChatCompletion;
const createChatCompletionShowWebView = (options) => {
    // 打开 webview，使用 emitter 监听结果，把结果回传给 script
    (0, WebView_1.showWebView)({
        key: 'main',
        lowcodeContext: options.lowcodeContext,
        task: {
            task: 'askLLM',
            data: {
                content: options.messages.map((m) => m.content).join('\n'),
                llm: options.llm,
            },
        },
        htmlForWebview: options.htmlForWebview,
    });
    return new Promise((resolve) => {
        emitter_1.emitter.on('chatGPTChunck', (data) => {
            if (options.handleChunk) {
                options.handleChunk(data);
            }
        });
        emitter_1.emitter.on('chatGPTComplete', (data) => {
            resolve(data);
            emitter_1.emitter.off('chatGPTChunck');
            emitter_1.emitter.off('chatGPTComplete');
        });
    });
};
exports.createChatCompletionShowWebView = createChatCompletionShowWebView;
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
