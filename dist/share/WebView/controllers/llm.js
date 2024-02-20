"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.askLLM = void 0;
const LLM_1 = require("../../LLM");
const callback_1 = require("../callback");
const askLLM = async (message, lowcodeContext) => {
    const res = await (0, LLM_1.createChatCompletion)({
        messages: message.data.messages,
        lowcodeContext,
        handleChunk(data) {
            (0, callback_1.invokeLLMChunkCallback)(lowcodeContext.webview, message.cbid, {
                content: data.text,
            });
        },
        llm: message.data.llm,
    });
    return {
        content: res,
    };
};
exports.askLLM = askLLM;
