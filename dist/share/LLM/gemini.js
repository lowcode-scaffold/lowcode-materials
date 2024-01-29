"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChatCompletion = void 0;
const generative_ai_1 = require("@google/generative-ai");
const undici_1 = require("undici");
const createChatCompletion = async (options) => {
    if (options.proxyUrl) {
        const dispatcher = new undici_1.ProxyAgent({
            uri: new URL(options.proxyUrl).toString(),
        });
        (0, undici_1.setGlobalDispatcher)(dispatcher);
    }
    const genAI = new generative_ai_1.GoogleGenerativeAI(options.apiKey);
    const model = genAI.getGenerativeModel({
        model: options.model,
        generationConfig: {
            maxOutputTokens: options.maxTokens,
            temperature: options.temperature,
            topP: options.topP,
        },
    });
    try {
        const result = await model.generateContentStream({
            contents: openAiMessageToGeminiMessage(options.messages),
        });
        let combinedResult = '';
        // eslint-disable-next-line no-restricted-syntax
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (options.handleChunk) {
                options.handleChunk({ text: chunkText, hasMore: false });
            }
            combinedResult += chunkText;
        }
        return combinedResult;
    }
    catch (ex) {
        if (options.handleChunk) {
            options.handleChunk({ text: ex.toString(), hasMore: false });
        }
        return ex.toString();
    }
};
exports.createChatCompletion = createChatCompletion;
const openAiMessageToGeminiMessage = (messages) => {
    const result = [];
    for (let i = 0; i < messages.length; i++) {
        const { role, content } = messages[i];
        const parts = [];
        if (role === 'system') {
            result.push({ role: 'user', parts: [{ text: content }] });
            result.push({ role: 'model', parts: [{ text: '' }] });
            // eslint-disable-next-line no-continue
            continue;
        }
        if (content == null || typeof content === 'string') {
            parts.push({ text: content?.toString() ?? '' });
        }
        else {
            for (let j = 0; j < content.length; j++) {
                const item = content[j];
                parts.push(item.type === 'text'
                    ? { text: item.text }
                    : parseBase64(item
                        .image_url.url));
            }
        }
        result.push({ role: role === 'user' ? 'user' : 'model', parts });
        if (i < messages.length - 1 &&
            messages[i + 1].role === 'user' &&
            role === 'user') {
            result.push({ role: 'model', parts: [{ text: '' }] });
        }
    }
    return result;
};
const parseBase64 = (base64) => {
    if (!base64.startsWith('data:')) {
        return { text: '' };
    }
    const [m, data, ..._arr] = base64.split(',');
    const mimeType = m.match(/:(?<mime>.*?);/)?.groups?.mime ?? 'img/png';
    return {
        inlineData: {
            mimeType,
            data,
        },
    };
};
