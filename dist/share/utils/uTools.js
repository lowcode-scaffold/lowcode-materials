"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOpenaiApiKey = void 0;
const electron_1 = require("electron");
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
