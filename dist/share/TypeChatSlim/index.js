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
exports.translate = void 0;
const ts = __importStar(require("typescript"));
const vscode_1 = require("vscode");
const result_1 = require("./result");
const libText = `interface Array<T> { length: number, [n: number]: T }
interface Object { toString(): string }
interface Function { prototype: unknown }
interface CallableFunction extends Function {}
interface NewableFunction extends Function {}
interface String { readonly length: number }
interface Boolean { valueOf(): boolean }
interface Number { valueOf(): number }
interface RegExp { test(string: string): boolean }`;
async function translate(option) {
    let requestPrompt = option.completePrompt ||
        `You are a service that translates user requests into JSON objects of type "${option.typeName}" according to the following TypeScript definitions:\n` +
            `\`\`\`\n${option.schema}\`\`\`\n` +
            `The following is a user request:\n` +
            `"""\n${option.request}\n"""\n` +
            `The following is the user request translated into a JSON object with 2 spaces of indentation and no properties with the value undefined:\n`;
    let tryCount = 1;
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
        let validation = validate(responseText.replace(/```json/g, '').replace(/```/g, ''), option.schema, option.typeName);
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
        if (tryCount > (option.tryCount || 3)) {
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
function validate(jsonText, schema, typeName) {
    let jsonObject;
    try {
        jsonObject = JSON.parse(jsonText);
    }
    catch (e) {
        return (0, result_1.error)(e instanceof SyntaxError ? e.message : 'JSON parse error');
    }
    stripNulls(jsonObject);
    const moduleResult = `import { ${typeName} } from './schema';\nconst json: ${typeName} = ${JSON.stringify(jsonObject, undefined, 2)};\n`;
    const program = createProgramFromModuleText({
        moduleText: moduleResult,
        schema,
    });
    const syntacticDiagnostics = program.getSyntacticDiagnostics();
    const programDiagnostics = syntacticDiagnostics.length
        ? syntacticDiagnostics
        : program.getSemanticDiagnostics();
    if (programDiagnostics.length) {
        const diagnostics = programDiagnostics
            .map((d) => typeof d.messageText === 'string'
            ? d.messageText
            : d.messageText.messageText)
            .join('\n');
        return (0, result_1.error)(diagnostics);
    }
    return (0, result_1.success)(jsonObject);
}
function createProgramFromModuleText(option) {
    const fileMap = new Map([
        createFileMapEntry('/lib.d.ts', libText),
        createFileMapEntry('/schema.ts', option.schema),
        createFileMapEntry('/json.ts', option.moduleText),
    ]);
    const host = {
        getSourceFile: (fileName) => fileMap.get(fileName),
        getDefaultLibFileName: () => 'lib.d.ts',
        writeFile: () => { },
        getCurrentDirectory: () => '/',
        getCanonicalFileName: (fileName) => fileName,
        useCaseSensitiveFileNames: () => true,
        getNewLine: () => '\n',
        fileExists: (fileName) => fileMap.has(fileName),
        readFile: (fileName) => '',
    };
    const options = {
        ...ts.getDefaultCompilerOptions(),
        strict: true,
        skipLibCheck: true,
        noLib: true,
        types: [],
    };
    return ts.createProgram(Array.from(fileMap.keys()), options, host, option.oldProgram);
}
function createFileMapEntry(filePath, fileText) {
    return [
        filePath,
        ts.createSourceFile(filePath, fileText, ts.ScriptTarget.Latest),
    ];
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
