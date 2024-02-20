"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.translate = void 0;
const ajv_1 = __importDefault(require("ajv"));
const vscode_1 = require("vscode");
const result_1 = require("./result");
async function translate(option) {
    let requestPrompt = option.completePrompt ||
        `你是一个根据以下 JSON Schema 定义将用户请求转换为相应 JSON 数据的服务，并且按照 JSON Schema 中 description 的描述对字段进行处理:\n` +
            `\`\`\`\n${option.schema}\`\`\`\n` +
            `The following is a user request:\n` +
            `"""\n${option.request}\n"""\n` +
            `The following is the user request translated into a JSON data with 2 spaces of indentation and no properties with the value undefined:\n`;
    let tryCount = 0;
    // eslint-disable-next-line no-unreachable-loop, no-constant-condition
    while (true) {
        const statusBarItem = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Left);
        statusBarItem.text = '$(sync~spin) Ask ChatGPT...';
        statusBarItem.show();
        // eslint-disable-next-line no-await-in-loop
        const responseText = await option
            .createChatCompletion({
            messages: [{ role: 'user', content: requestPrompt }],
            handleChunk: undefined,
            showWebview: option.showWebview,
        })
            .finally(() => {
            statusBarItem.hide();
            statusBarItem.dispose();
        });
        let validation = validate(responseText.replace(/```/g, ''), option.schema);
        if (validation.success) {
            // 走额外的校验
            if (option.extendValidate) {
                validation = option.extendValidate(validation.data);
                if (validation.success) {
                    return validation;
                }
            }
            else {
                return validation;
            }
        }
        if (tryCount > 3) {
            return validation;
        }
        requestPrompt += `${responseText}\n${createRepairPrompt(validation.message)}`;
        tryCount++;
    }
}
exports.translate = translate;
function createRepairPrompt(validationError) {
    return (`The JSON object is invalid for the following reason:\n` +
        `"""\n${validationError}\n"""\n` +
        `The following is a revised JSON object:\n`);
}
function validate(jsonText, schema) {
    let jsonObject;
    try {
        jsonObject = JSON.parse(jsonText);
    }
    catch (e) {
        return (0, result_1.error)(e instanceof SyntaxError ? e.message : 'JSON parse error');
    }
    stripNulls(jsonObject);
    const ajv = new ajv_1.default();
    const jsonValidate = ajv.compile(JSON.parse(schema));
    const valid = jsonValidate(jsonObject);
    if (!valid) {
        console.log(jsonValidate.errors);
        return (0, result_1.error)(jsonValidate.errors?.map((s) => s.message || s.keyword).join(',') || '');
    }
    return (0, result_1.success)(jsonObject);
}
function stripNulls(obj) {
    let keysToDelete;
    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const k in obj) {
        const value = obj[k];
        if (value === null) {
            (keysToDelete ??= []).push(k);
        }
        else {
            if (Array.isArray(value)) {
                if (value.some((x) => x === null)) {
                    obj[k] = value.filter((x) => x !== null);
                }
            }
            if (typeof value === 'object') {
                stripNulls(value);
            }
        }
    }
    if (keysToDelete) {
        // eslint-disable-next-line no-restricted-syntax
        for (const k of keysToDelete) {
            delete obj[k];
        }
    }
}
