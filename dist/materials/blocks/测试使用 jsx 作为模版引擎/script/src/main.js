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
exports.handleComplete = exports.handleAfterCompile = exports.handleAskChatGPT = exports.handleInitColumnsFromImage = exports.handleInitFiltersFromImage = void 0;
const path = __importStar(require("path"));
const vscode_1 = require("vscode");
const fs = __importStar(require("fs-extra"));
const execa = __importStar(require("execa"));
const ejs = __importStar(require("ejs"));
const axios_1 = __importDefault(require("axios"));
const lint_1 = require("../../../../../share/utils/lint");
const tsx_1 = require("../../../../../share/utils/tsx");
const index_1 = require("../../../../../share/TypeChatSlim/index");
const index_2 = require("../../../../../share/BaiduOCR/index");
const context_1 = require("./context");
const json_1 = require("../../../../../share/utils/json");
async function handleInitFiltersFromImage() {
    const { lowcodeContext } = context_1.context;
    if (!lowcodeContext?.clipboardImage) {
        vscode_1.window.showInformationMessage('剪贴板里没有截图');
        return lowcodeContext?.model;
    }
    const ocrRes = await (0, index_2.generalBasic)({ image: lowcodeContext.clipboardImage });
    vscode_1.env.clipboard.writeText(ocrRes.words_result.map((s) => s.words).join('\r\n'));
    vscode_1.window.showInformationMessage('内容已经复制到剪贴板');
    const filters = ocrRes.words_result
        .map((s) => s.words)
        .reduce((result, value, index, array) => {
        if (index % 2 === 0) {
            result.push(array.slice(index, index + 2));
        }
        return result;
    }, []);
    const formatedFilters = filters.map((s) => ({
        component: s[1].indexOf('选择') > -1 ? 'select' : 'input',
        key: s[0].replace(/:|：/g, '').trim(),
        label: s[0].replace(/:|：/g, '').trim(),
        placeholder: s[1],
    }));
    return { ...lowcodeContext.model, filters: formatedFilters };
}
exports.handleInitFiltersFromImage = handleInitFiltersFromImage;
async function handleInitColumnsFromImage() {
    const { lowcodeContext } = context_1.context;
    if (!lowcodeContext?.clipboardImage) {
        vscode_1.window.showInformationMessage('剪贴板里没有截图');
        return lowcodeContext?.model;
    }
    const ocrRes = await (0, index_2.generalBasic)({ image: lowcodeContext.clipboardImage });
    vscode_1.env.clipboard.writeText(ocrRes.words_result.map((s) => s.words).join('\r\n'));
    vscode_1.window.showInformationMessage('内容已经复制到剪贴板');
    const columns = ocrRes.words_result.map((s) => ({
        slot: false,
        title: s.words,
        dataIndex: s.words,
        key: s.words,
    }));
    return { ...lowcodeContext.model, columns };
}
exports.handleInitColumnsFromImage = handleInitColumnsFromImage;
async function handleAskChatGPT() {
    const { lowcodeContext } = context_1.context;
    const schema = fs.readFileSync(path.join(lowcodeContext.materialPath, 'config/schema.ts'), 'utf8');
    const typeName = 'PageConfig';
    const res = await (0, index_1.translate)({
        schema,
        typeName,
        request: JSON.stringify(lowcodeContext.model),
        completePrompt: `你是一个根据以下 TypeScript 类型定义将用户请求转换为 "${typeName}" 类型的 JSON 对象的服务，并且按照字段的注释进行处理:\n` +
            `\`\`\`\n${schema}\`\`\`\n` +
            `以下是用户请求:\n` +
            `"""\n${JSON.stringify(lowcodeContext.model)}\n"""\n` +
            `The following is the user request translated into a JSON object with 2 spaces of indentation and no properties with the value undefined:\n`,
        createChatCompletion: lowcodeContext.createChatCompletion,
        showWebview: true,
        extendValidate: (jsonObject) => ({ success: true, data: jsonObject }),
    });
    lowcodeContext.outputChannel.appendLine(JSON.stringify(res, null, 2));
    if (res.success) {
        return { ...res.data };
    }
    return lowcodeContext.model;
}
exports.handleAskChatGPT = handleAskChatGPT;
async function handleAfterCompile() {
    const { lowcodeContext } = context_1.context;
    const tempWorkPath = path.join(lowcodeContext?.env.privateMaterialsPath || '', '.lowcode');
    await (0, tsx_1.renderTemplates)({
        ...lowcodeContext?.model,
        title: '12121',
    }, path.join(tempWorkPath, 'src'));
}
exports.handleAfterCompile = handleAfterCompile;
async function handleComplete() {
    const { lowcodeContext } = context_1.context;
    const createBlockPath = context_1.context.lowcodeContext?.createBlockPath;
    if (createBlockPath) {
        // #region lint
        (0, lint_1.lint)({
            createBlockPath,
            rootPath: lowcodeContext.env.rootPath,
        });
        // #endregion
        // #region 更新 mock 服务
        const mockType = fs
            .readFileSync(path.join(createBlockPath, 'temp.mock.type').toString())
            .toString();
        fs.removeSync(path.join(createBlockPath, 'temp.mock.type'));
        const { mockCode, mockData } = (0, json_1.typescriptToMock)(mockType);
        const mockTemplate = fs
            .readFileSync(path.join(createBlockPath, 'temp.mock.script.ejs').toString())
            .toString();
        fs.removeSync(path.join(createBlockPath, 'temp.mock.script.ejs'));
        // @ts-ignore
        if (!lowcodeContext?.model.includeModifyModal) {
            fs.removeSync(path.join(path.join(createBlockPath, 'ModifyModal')));
        }
        const mockScript = ejs.render(mockTemplate, {
            ...lowcodeContext.model,
            mockCode,
            mockData,
            createBlockPath: createBlockPath.replace(':', ''),
        });
        const mockProjectPathRes = await axios_1.default
            .get('http://localhost:3001/mockProjectPath', { timeout: 1000 })
            .catch(() => {
            vscode_1.window.showInformationMessage('获取 mock 项目路径失败，跳过更新 mock 服务');
        });
        if (mockProjectPathRes?.data.result) {
            const projectName = vscode_1.workspace.rootPath
                ?.replace(/\\/g, '/')
                .split('/')
                .pop();
            const mockRouteFile = path.join(mockProjectPathRes.data.result, `${projectName}.js`);
            let mockFileContent = `
			import KoaRouter from 'koa-router';
			import proxy from '../middleware/Proxy';
			import { delay } from '../lib/util';

			const Mock = require('mockjs');

			const { Random } = Mock;

			const router = new KoaRouter();
			router{{mockScript}}
			module.exports = router;
			`;
            if (fs.existsSync(mockRouteFile)) {
                mockFileContent = fs.readFileSync(mockRouteFile).toString().toString();
                const index = mockFileContent.lastIndexOf(')') + 1;
                mockFileContent = `${mockFileContent.substring(0, index)}{{mockScript}}\n${mockFileContent.substring(index)}`;
            }
            mockFileContent = mockFileContent.replace(/{{mockScript}}/g, mockScript);
            fs.writeFileSync(mockRouteFile, mockFileContent);
            try {
                execa.sync('node', [
                    path.join(mockProjectPathRes.data.result
                        .replace(/\\/g, '/')
                        .replace('/src/routes', ''), '/node_modules/eslint/bin/eslint.js'),
                    mockRouteFile,
                    '--resolve-plugins-relative-to',
                    mockProjectPathRes.data.result
                        .replace(/\\/g, '/')
                        .replace('/src/routes', ''),
                    '--fix',
                ]);
            }
            catch (err) {
                console.log(err);
            }
            // #endregion
        }
    }
}
exports.handleComplete = handleComplete;
