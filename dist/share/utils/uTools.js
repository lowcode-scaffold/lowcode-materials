"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.askChatGPT = exports.screenCapture = exports.getOpenaiApiKey = void 0;
const electron_1 = require("electron");
const openaiV2_1 = require("../LLM/openaiV2");
const getOpenaiApiKey = () => new Promise((resolve, reject) => {
    // utools.dbStorage.removeItem('lowcode.openaiApiKey'); // 需要更新 api key 的时候打开
    const cacheKey = utools.dbStorage.getItem('lowcode.openaiApiKey');
    if (cacheKey) {
        resolve(cacheKey);
        return;
    }
    const oldClip = electron_1.clipboard.readText();
    utools.showNotification('请在输入框中粘贴 api key');
    utools.setSubInput((input) => {
        const key = input.text;
        utools.dbStorage.setItem('lowcode.openaiApiKey', key);
        electron_1.clipboard.writeText(oldClip);
        resolve(key);
    }, '请粘贴 api key', true);
});
exports.getOpenaiApiKey = getOpenaiApiKey;
const screenCapture = () => new Promise((resolve, reject) => {
    utools.screenCapture((res) => {
        resolve(res);
    });
});
exports.screenCapture = screenCapture;
const askChatGPT = async (data) => {
    let { apiKey } = data;
    if (!apiKey) {
        apiKey = await (0, exports.getOpenaiApiKey)();
    }
    const res = await (0, openaiV2_1.createChatCompletion)({
        apiKey,
        hostname: data.hostname,
        apiPath: data.apiPath,
        messages: data.messages,
        model: data.model,
        maxTokens: data.maxTokens,
        handleChunk(chunck) {
            data.handleChunk(chunck.text || '');
        },
    });
    return { content: res };
};
exports.askChatGPT = askChatGPT;
