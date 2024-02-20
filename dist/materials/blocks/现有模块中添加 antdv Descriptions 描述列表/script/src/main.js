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
exports.handleComplete = exports.handleIntFromClipboardImage = exports.handleAskChatGPT = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const execa = __importStar(require("execa"));
const ejs = __importStar(require("ejs"));
const axios_1 = __importDefault(require("axios"));
const vscode_1 = require("vscode");
const index_1 = require("../../../../../share/TypeChatSlim/index");
const index_2 = require("../../../../../share/BaiduOCR/index");
const context_1 = require("./context");
const json_1 = require("../../../../../share/utils/json");
async function handleAskChatGPT() {
    const { lowcodeContext } = context_1.context;
    const schema = fs.readFileSync(path.join(lowcodeContext.materialPath, 'config/schema.ts'), 'utf8');
    const typeName = 'IItems';
    const res = await (0, index_1.translate)({
        schema,
        typeName,
        request: JSON.stringify(lowcodeContext.model.items),
        completePrompt: `你是一个根据以下 TypeScript 类型定义将用户请求转换为 "${typeName}" 类型的 JSON 对象的服务，并且按照字段的注释进行处理:\n` +
            `\`\`\`\n${schema}\`\`\`\n` +
            `以下是用户请求:\n` +
            `"""\n${JSON.stringify(lowcodeContext.model.items)}\n"""\n` +
            `The following is the user request translated into a JSON object with 2 spaces of indentation and no properties with the value undefined:\n`,
        createChatCompletion: lowcodeContext.createChatCompletion,
        showWebview: true,
        extendValidate: (jsonObject) => ({ success: true, data: jsonObject }),
    });
    lowcodeContext.outputChannel.appendLine(JSON.stringify(res, null, 2));
    if (res.success) {
        return { ...lowcodeContext.model, items: res.data };
    }
    return lowcodeContext.model;
}
exports.handleAskChatGPT = handleAskChatGPT;
async function handleIntFromClipboardImage() {
    const { lowcodeContext } = context_1.context;
    if (!lowcodeContext?.clipboardImage) {
        vscode_1.window.showInformationMessage('剪贴板里获取不到图片');
        return lowcodeContext?.model;
    }
    const ocrRes = await (0, index_2.generalBasic)({ image: lowcodeContext.clipboardImage });
    const items = [];
    ocrRes.words_result.map((s, index) => {
        const includeColon = s.words.includes(':') || s.words.includes('：');
        if (includeColon) {
            const work = s.words.split(/:|：/g)[0];
            items.push({
                key: work,
                label: work,
            });
        }
        else if (index % 2 === 0) {
            const work = s.words.split(/:|：/g)[0];
            items.push({
                key: work,
                label: work,
            });
        }
    });
    const schema = fs.readFileSync(path.join(lowcodeContext.materialPath, 'config/schema.ts'), 'utf8');
    const typeName = 'IItems';
    const res = await (0, index_1.translate)({
        schema,
        typeName,
        request: JSON.stringify(items),
        completePrompt: `你是一个根据以下 TypeScript 类型定义将用户请求转换为 "${typeName}" 类型的 JSON 对象的服务，并且按照字段的注释进行处理:\n` +
            `\`\`\`\n${schema}\`\`\`\n` +
            `以下是用户请求:\n` +
            `"""\n${JSON.stringify(items)}\n"""\n` +
            `The following is the user request translated into a JSON object with 2 spaces of indentation and no properties with the value undefined:\n`,
        createChatCompletion: lowcodeContext.createChatCompletion,
        showWebview: true,
        extendValidate: (jsonObject) => ({ success: true, data: jsonObject }),
    });
    lowcodeContext.outputChannel.appendLine(JSON.stringify(res, null, 2));
    if (res.success) {
        return { ...lowcodeContext.model, items: res.data };
    }
    return { ...lowcodeContext.model };
}
exports.handleIntFromClipboardImage = handleIntFromClipboardImage;
async function handleComplete() {
    const { lowcodeContext } = context_1.context;
    const createBlockPath = context_1.context.lowcodeContext?.createBlockPath;
    if (createBlockPath) {
        // #region 更新 api.ts 文件
        const apiFileContent = fs
            .readFileSync(path.join(createBlockPath, 'temp.api.ts'))
            .toString();
        let apiFileContentOld = '';
        try {
            apiFileContentOld = fs
                .readFileSync(path.join(createBlockPath, 'api.ts').toString())
                .toString();
        }
        catch { }
        fs.writeFileSync(path.join(createBlockPath, 'api.ts'), apiFileContentOld + apiFileContent);
        fs.removeSync(path.join(createBlockPath, 'temp.api.ts'));
        try {
            execa.sync('node', [
                path.join(vscode_1.workspace.rootPath, '/node_modules/eslint/bin/eslint.js'),
                path.join(createBlockPath, 'api.ts'),
                '--resolve-plugins-relative-to',
                vscode_1.workspace.rootPath,
                '--fix',
            ]);
        }
        catch (err) {
            console.log(err);
        }
        // #endregion
        // #region 更新 model.ts 文件
        const modelFileContent = fs
            .readFileSync(path.join(createBlockPath, 'temp.model.ts'))
            .toString();
        let modelFileContentOld = fs
            .readFileSync(path.join(createBlockPath, 'model.ts').toString())
            .toString();
        const keywords = [
            '// lowcode-model-import-api',
            '// lowcode-model-type',
            '// lowcode-model-variable',
            '// lowcode-model-return-variable',
        ];
        const modelSplitArr = modelFileContent.split(new RegExp(keywords.join('|'), 'ig'));
        const modelImportApi = modelSplitArr[1].replace(/\n/g, '');
        const modelType = modelSplitArr[2];
        const modelVariable = modelSplitArr[3];
        const modelReturnVariable = modelSplitArr[4].replace(/\n/g, '');
        if (!modelFileContentOld.includes('// lowcode-model-import-api')) {
            modelFileContentOld = `// lowcode-model-import-api\n${modelFileContentOld}`;
        }
        modelFileContentOld = modelFileContentOld.replace('// lowcode-model-import-api', modelImportApi);
        if (!modelFileContentOld.includes('// lowcode-model-type')) {
            modelFileContentOld = modelFileContentOld.replace('export const useModel', '// lowcode-model-type\nexport const useModel');
        }
        modelFileContentOld = modelFileContentOld.replace('// lowcode-model-type', modelType);
        if (!modelFileContentOld.includes('// lowcode-model-variable')) {
            modelFileContentOld = modelFileContentOld.replace('return {', '// lowcode-model-variable\nreturn {');
        }
        modelFileContentOld = modelFileContentOld.replace('// lowcode-model-variable', modelVariable);
        if (!modelFileContentOld.includes('// lowcode-model-return-variable')) {
            modelFileContentOld = modelFileContentOld.replace('return {', 'return {\n// lowcode-model-return-variable');
        }
        modelFileContentOld = modelFileContentOld.replace('// lowcode-model-return-variable', modelReturnVariable);
        fs.writeFileSync(path.join(createBlockPath, 'model.ts'), modelFileContentOld);
        fs.removeSync(path.join(createBlockPath, 'temp.model.ts'));
        try {
            execa.sync('node', [
                path.join(vscode_1.workspace.rootPath, '/node_modules/eslint/bin/eslint.js'),
                path.join(createBlockPath, 'model.ts'),
                '--resolve-plugins-relative-to',
                vscode_1.workspace.rootPath,
                '--fix',
            ]);
        }
        catch (err) {
            console.log(err);
        }
        // #endregion
        // #region 更新 service.ts 文件
        const serviceFileContent = fs
            .readFileSync(path.join(createBlockPath, 'temp.service.ts').toString())
            .toString();
        let serviceFileContentOld = fs
            .readFileSync(path.join(createBlockPath, 'service.ts').toString())
            .toString()
            .trim();
        const serviceSplitArr = serviceFileContent.split(new RegExp(['// lowcode-service-import-api', '// lowcode-service-method'].join('|'), 'ig'));
        const serviceImportApi = serviceSplitArr[1].replace(/\n/g, '');
        const serviceMethod = serviceSplitArr[2];
        if (!serviceFileContentOld.includes('// lowcode-service-import-api')) {
            serviceFileContentOld = `// lowcode-service-import-api\n${serviceFileContentOld}`;
        }
        serviceFileContentOld = serviceFileContentOld.replace('// lowcode-service-import-api', serviceImportApi);
        if (!serviceFileContentOld.includes('// lowcode-service-method')) {
            serviceFileContentOld = `${serviceFileContentOld.slice(0, serviceFileContentOld.length - 1)}// lowcode-service-method\n}`;
        }
        serviceFileContentOld = serviceFileContentOld.replace('// lowcode-service-method', serviceMethod);
        fs.writeFileSync(path.join(createBlockPath, 'service.ts'), serviceFileContentOld);
        fs.removeSync(path.join(createBlockPath, 'temp.service.ts'));
        try {
            execa.sync('node', [
                path.join(vscode_1.workspace.rootPath, '/node_modules/eslint/bin/eslint.js'),
                path.join(createBlockPath, 'service.ts'),
                '--resolve-plugins-relative-to',
                vscode_1.workspace.rootPath,
                '--fix',
            ]);
        }
        catch (err) {
            console.log(err);
        }
        // #endregion
        // #region 更新 index.vue 文件
        const vueFileContent = fs
            .readFileSync(path.join(createBlockPath, 'temp.index.vue').toString())
            .toString();
        let vueFileContentOld = fs
            .readFileSync(path.join(createBlockPath, 'index.vue').toString())
            .toString();
        const vueSplitArr = vueFileContent.split(new RegExp(['<!-- lowcode-vue-template -->'].join('|'), 'ig'));
        const vueTemplate = vueSplitArr[1];
        if (!vueFileContentOld.includes('<!-- lowcode-vue-template -->')) {
            const index = vueFileContentOld.lastIndexOf('</template>');
            vueFileContentOld = `${vueFileContentOld.substring(0, index)}<!-- lowcode-vue-template -->${vueFileContentOld.substring(index)}`;
        }
        vueFileContentOld = vueFileContentOld.replace('<!-- lowcode-vue-template -->', vueTemplate);
        fs.writeFileSync(path.join(createBlockPath, 'index.vue'), vueFileContentOld);
        fs.removeSync(path.join(createBlockPath, 'temp.index.vue'));
        try {
            execa.sync('node', [
                path.join(vscode_1.workspace.rootPath, '/node_modules/eslint/bin/eslint.js'),
                path.join(createBlockPath, 'index.vue'),
                '--resolve-plugins-relative-to',
                vscode_1.workspace.rootPath,
                '--fix',
            ]);
        }
        catch (err) {
            console.log(err);
        }
        // #endregion
        // #region 更新 mock 服务
        const mockType = fs
            .readFileSync(path.join(createBlockPath, 'temp.mock.type').toString())
            .toString();
        fs.removeSync(path.join(createBlockPath, 'temp.mock.type'));
        const { mockCode, mockData } = (0, json_1.typescriptToMock)(mockType);
        const mockTemplate = fs
            .readFileSync(path.join(createBlockPath, 'temp.mock.script').toString())
            .toString();
        fs.removeSync(path.join(createBlockPath, 'temp.mock.script'));
        const mockScript = ejs.render(mockTemplate, {
            ...lowcodeContext.model,
            mockCode,
            mockData,
            createBlockPath: createBlockPath.replace(':', ''),
        });
        const mockProjectPathRes = await axios_1.default
            .get('http://localhost:3001/mockProjectPath', { timeout: 1000 })
            .catch(() => {
            vscode_1.window.showErrorMessage('获取 mock 项目路径失败');
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
