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
exports.createChatCompletion = exports.getChatGPTConfig = void 0;
/* eslint-disable no-shadow */
const https = __importStar(require("https"));
const util_1 = require("util");
const vscode_1 = require("vscode");
const getChatGPTConfig = () => {
    const hostname = vscode_1.workspace
        .getConfiguration('lowcode')
        .get('hostname', 'api.openai.com');
    const apiPath = vscode_1.workspace
        .getConfiguration('lowcode')
        .get('apiPath', '/v1/chat/completions');
    const apiKey = vscode_1.workspace
        .getConfiguration('lowcode')
        .get('apiKey', '');
    const model = vscode_1.workspace
        .getConfiguration('lowcode')
        .get('model', 'gpt-3.5-turbo');
    const maxTokens = vscode_1.workspace
        .getConfiguration('lowcode')
        .get('maxTokens', 2000);
    const temperature = vscode_1.workspace
        .getConfiguration('lowcode')
        .get('temperature', 0.3);
    return {
        hostname,
        apiPath,
        apiKey,
        model,
        maxTokens,
        temperature,
    };
};
exports.getChatGPTConfig = getChatGPTConfig;
const createChatCompletion = (options) => new Promise((resolve, reject) => {
    let combinedResult = '';
    let error = '发生错误：';
    const request = https.request({
        hostname: options.hostname || (0, exports.getChatGPTConfig)().hostname || 'api.openai.com',
        port: 443,
        path: options.apiPath ||
            (0, exports.getChatGPTConfig)().apiPath ||
            '/v1/chat/completions',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${options.apiKey || (0, exports.getChatGPTConfig)().apiKey}`,
        },
    }, (res) => {
        res.on('data', async (chunk) => {
            const text = new util_1.TextDecoder('utf-8').decode(chunk);
            const data = text.split('\n\n').filter((s) => s);
            for (let i = 0; i < data.length; i++) {
                try {
                    let element = data[i];
                    if (element.includes('data: ')) {
                        if (element.trim() === 'data:') {
                            // 处理只返回了 data: 的情况
                            return;
                        }
                    }
                    else if (element.includes('delta')) {
                        // 处理没有 data 开头
                        element = `data: ${element}`;
                    }
                    if (element.includes('data: ')) {
                        if (element.includes('[DONE]')) {
                            if (options.handleChunk) {
                                options.handleChunk({ text: '' });
                            }
                            return;
                        }
                        // remove 'data: '
                        const data = JSON.parse(element.replace('data: ', ''));
                        if (data.finish_reason === 'stop') {
                            if (options.handleChunk) {
                                options.handleChunk({ text: '' });
                            }
                            return;
                        }
                        const openaiRes = data.choices[0].delta.content;
                        if (openaiRes) {
                            if (options.handleChunk) {
                                options.handleChunk({
                                    text: openaiRes.replaceAll('\\n', '\n'),
                                });
                            }
                            combinedResult += openaiRes;
                        }
                    }
                    else {
                        if (options.handleChunk) {
                            options.handleChunk({
                                text: element,
                            });
                        }
                        return;
                    }
                }
                catch (e) {
                    console.error({
                        e,
                        element: data[i],
                    });
                    error = e.toString();
                }
            }
        });
        res.on('error', (e) => {
            if (options.handleChunk) {
                options.handleChunk({
                    text: e.toString(),
                });
            }
            reject(e);
        });
        res.on('end', () => {
            if (error !== '发生错误：') {
                if (options.handleChunk) {
                    options.handleChunk({
                        text: error,
                    });
                }
            }
            resolve(combinedResult || error);
        });
    });
    const body = {
        model: options.model || (0, exports.getChatGPTConfig)().model,
        messages: options.messages,
        stream: true,
        max_tokens: options.maxTokens || (0, exports.getChatGPTConfig)().maxTokens,
    };
    request.on('error', (error) => {
        // eslint-disable-next-line no-unused-expressions
        options.handleChunk && options.handleChunk({ text: error.toString() });
        resolve(error.toString());
    });
    request.write(JSON.stringify(body));
    request.end();
});
exports.createChatCompletion = createChatCompletion;
