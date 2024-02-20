"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invokeErrorCallback = exports.invokeLLMChunkCallback = exports.invokeCallback = void 0;
function invokeCallback(webview, cbid, res) {
    webview.postMessage({
        cmd: 'vscodeCallback',
        cbid,
        data: res,
        code: 200,
    });
}
exports.invokeCallback = invokeCallback;
function invokeLLMChunkCallback(webview, cbid, res) {
    webview.postMessage({
        cmd: 'vscodeLLMChunkCallback',
        task: 'handleLLMChunk',
        cbid,
        data: res,
        code: 200,
    });
}
exports.invokeLLMChunkCallback = invokeLLMChunkCallback;
function invokeErrorCallback(webview, cbid, res) {
    webview.postMessage({
        cmd: 'vscodeCallback',
        cbid,
        data: res,
        code: 400,
    });
}
exports.invokeErrorCallback = invokeErrorCallback;
