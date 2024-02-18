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
                options.handleChunk({ text: chunkText });
            }
            combinedResult += chunkText;
        }
        return combinedResult;
    }
    catch (ex) {
        if (options.handleChunk) {
            options.handleChunk({ text: ex.toString() });
        }
        return ex.toString();
    }
};
exports.createChatCompletion = createChatCompletion;
const openAiMessageToGeminiMessage = (messages) => {
    const result = [];
    const hasImage = messages.some((s) => Array.isArray(s.content) && s.content.some((c) => c.type === 'image_url'));
    if (hasImage) {
        result.push({ role: 'user', parts: [] });
        const partsText = [];
        let imagePart;
        for (let i = 0; i < messages.length; i++) {
            const { role, content } = messages[i];
            if (role === 'system') {
                partsText.push(content);
                // eslint-disable-next-line no-continue
                continue;
            }
            if (content == null || typeof content === 'string') {
                partsText.push(content || '');
            }
            else {
                for (let j = 0; j < content.length; j++) {
                    const item = content[j];
                    if (item.type === 'text') {
                        partsText.push(item.text || '');
                    }
                    else {
                        imagePart = parseBase64(item
                            .image_url.url);
                    }
                }
            }
        }
        result[0].parts = [{ text: partsText.join('\n') }, imagePart];
    }
    else {
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
