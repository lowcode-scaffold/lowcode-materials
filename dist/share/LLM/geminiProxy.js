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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChatCompletion = void 0;
/* eslint-disable no-shadow */
const https = __importStar(require("https"));
const util_1 = require("util");
const tunnel_1 = __importDefault(require("tunnel"));
const agent = tunnel_1.default.httpsOverHttp({
    proxy: {
        host: '127.0.0.1',
        port: 7890,
    },
});
const createChatCompletion = (options) => new Promise((resolve, reject) => {
    let combinedResult = '';
    let error = '发生错误：';
    const request = https.request({
        hostname: 'api.gemini-chat.pro',
        port: 443,
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Referer: 'https://gemini-chat.pro/',
            Origin: 'https://gemini-chat.pro',
        },
        agent,
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
                                options.handleChunk({ hasMore: true, text: '' });
                                // emitter.emit('chatGPTChunck', { hasMore: true, text: '' });
                            }
                            return;
                        }
                        // remove 'data: '
                        const data = JSON.parse(element.replace('data: ', ''));
                        if (data.finish_reason === 'stop') {
                            if (options.handleChunk) {
                                options.handleChunk({ hasMore: true, text: '' });
                                // emitter.emit('chatGPTChunck', { hasMore: true, text: '' });
                            }
                            return;
                        }
                        const openaiRes = data.choices[0].delta.content;
                        if (openaiRes) {
                            if (options.handleChunk) {
                                options.handleChunk({
                                    text: openaiRes.replaceAll('\\n', '\n'),
                                    hasMore: true,
                                });
                                // emitter.emit('chatGPTChunck', {
                                //   text: openaiRes.replaceAll('\\n', '\n'),
                                //   hasMore: true,
                                // });
                            }
                            combinedResult += openaiRes;
                        }
                    }
                    else {
                        if (options.handleChunk) {
                            options.handleChunk({
                                hasMore: true,
                                text: element,
                            });
                            // emitter.emit('chatGPTChunck', {
                            //   hasMore: true,
                            //   text: element,
                            // });
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
                    hasMore: true,
                    text: e.toString(),
                });
                // emitter.emit('chatGPTChunck', {
                //   hasMore: true,
                //   text: e.toString(),
                // });
            }
            reject(e);
        });
        res.on('end', () => {
            if (error !== '发生错误：') {
                if (options.handleChunk) {
                    options.handleChunk({
                        hasMore: true,
                        text: error,
                    });
                    // emitter.emit('chatGPTChunck', {
                    //   hasMore: true,
                    //   text: error,
                    // });
                }
            }
            resolve(combinedResult || error);
            // emitter.emit('chatGPTComplete', combinedResult || error);
        });
    });
    const body = {
        model: options.model,
        messages: options.messages,
        stream: true,
        max_tokens: options.maxTokens,
        presence_penalty: 0,
        temperature: 0.5,
        top_p: 1,
        frequency_penalty: 0,
    };
    request.on('error', (error) => {
        // eslint-disable-next-line no-unused-expressions
        options.handleChunk &&
            options.handleChunk({ hasMore: true, text: error.toString() });
        resolve(error.toString());
        // emitter.emit('chatGPTComplete', error.toString());
    });
    request.write(JSON.stringify(body));
    request.end();
});
exports.createChatCompletion = createChatCompletion;
