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
exports.genCodeByYapi = void 0;
const vscode_1 = require("vscode");
const json_schema_to_typescript_1 = require("json-schema-to-typescript");
const strip_comments_1 = __importDefault(require("strip-comments"));
const jsonminify_1 = __importDefault(require("jsonminify"));
const GenerateSchema = __importStar(require("generate-schema"));
const ejs_1 = require("../utils/ejs");
const request_1 = require("../utils/request");
const editor_1 = require("../utils/editor");
const json_1 = require("../utils/json");
const config_1 = require("../utils/config");
const material_1 = require("../utils/material");
const context_1 = require("../context");
const genCodeByYapi = async () => {
    const domain = (0, config_1.getConfig)().yapi?.domain || '';
    if (!domain.trim()) {
        vscode_1.window.showErrorMessage('请配置yapi域名');
        return;
    }
    const projectList = (0, config_1.getConfig)().yapi?.projects || [];
    if (projectList.length === 0) {
        vscode_1.window.showErrorMessage('请配置项目');
    }
    const rawClipboardText = await vscode_1.env.clipboard.readText();
    if (!rawClipboardText) {
        vscode_1.window.showErrorMessage('请复制 yapi 接口 id');
        return;
    }
    const selectInfo = (0, editor_1.getFuncNameAndTypeName)();
    const result = await vscode_1.window.showQuickPick(projectList.map((s) => s.name), { placeHolder: '请选择项目' });
    if (!result) {
        return;
    }
    const project = projectList.find((s) => s.name === result);
    const { lowcodeContext } = context_1.context;
    const template = (0, material_1.getMaterial)(lowcodeContext.materialPath);
    try {
        const model = await genTemplateModelByYapi(project?.domain || domain, rawClipboardText, project.token, selectInfo.typeName, selectInfo.funcName);
        if (model) {
            model.rawSelectedText = selectInfo.rawSelectedText;
            model.rawClipboardText = rawClipboardText;
            const code = (0, ejs_1.compile)(template.template, model);
            (0, editor_1.pasteToEditor)(code);
        }
    }
    catch (e) {
        vscode_1.window.showErrorMessage(e.toString());
    }
};
exports.genCodeByYapi = genCodeByYapi;
const genTemplateModelByYapi = async (domain, yapiId, token, typeNameOriginal, funcNameOriginal) => {
    let funcName = funcNameOriginal;
    let typeName = typeNameOriginal;
    const res = await (0, request_1.fetchApiDetailInfo)(domain, yapiId, token);
    if (!res.data.data) {
        throw res.data.errmsg;
    }
    funcName = await context_1.context.lowcodeContext.createChatCompletion({
        messages: [
            {
                role: 'system',
                content: `你是一个代码专家，按照用户传给你的 api 接口地址，和接口请求方法，根据接口地址里的信息推测出一个生动形象的方法名称，驼峰格式，返回方法名称`,
            },
            {
                role: 'user',
                content: `api 地址：${res.data.data.query_path}，${res.data.data.method} 方法，作用是${res.data.data.title}`,
            },
        ],
    });
    typeName = `I${funcName.charAt(0).toUpperCase() + funcName.slice(1)}Result`;
    const requestBodyTypeName = funcName.slice(0, 1).toUpperCase() + funcName.slice(1);
    if (res.data.data.res_body_type === 'json') {
        const schema = JSON.parse((0, jsonminify_1.default)(res.data.data.res_body));
        fixSchema(schema, ['$ref', '$$ref']);
        delete schema.title;
        let ts = await (0, json_schema_to_typescript_1.compile)(schema, typeName, {
            bannerComment: '',
        });
        ts = ts.replace(/(\[k: string\]: unknown;)|\?/g, '');
        const { mockCode, mockData } = (0, json_1.mockFromSchema)(schema);
        let requestBodyType = '';
        if (res.data.data.req_body_other) {
            const reqBodyScheme = JSON.parse(res.data.data.req_body_other);
            fixSchema(reqBodyScheme, ['$ref', '$$ref']);
            delete reqBodyScheme.title;
            requestBodyType = await (0, json_schema_to_typescript_1.compile)(reqBodyScheme, `I${requestBodyTypeName}Data`, {
                bannerComment: '',
            });
        }
        const model = {
            type: ts,
            requestBodyType: requestBodyType.replace(/\[k: string\]: unknown;/g, ''),
            funcName,
            typeName,
            api: res.data.data,
            yapiDomain: domain,
            inputValues: [],
            mockCode,
            mockData,
            jsonData: {},
            rawSelectedText: '',
            rawClipboardText: '',
        };
        return model;
    }
    // yapi 返回数据直接贴的 json
    const resBodyJson = JSON.parse((0, jsonminify_1.default)(res.data.data.res_body));
    const schema = GenerateSchema.json(typeName || 'Schema', resBodyJson);
    fixSchema(schema, ['$ref', '$$ref']);
    let ts = await (0, json_schema_to_typescript_1.compile)(schema, typeName, {
        bannerComment: '',
    });
    ts = (0, strip_comments_1.default)(ts.replace(/(\[k: string\]: unknown;)|\?/g, ''));
    const { mockCode, mockData } = (0, json_1.mockFromSchema)(schema);
    let requestBodyType = '';
    if (res.data.data.req_body_other) {
        const reqBodyScheme = JSON.parse((0, jsonminify_1.default)(res.data.data.req_body_other));
        fixSchema(reqBodyScheme, ['$ref', '$$ref']);
        delete reqBodyScheme.title;
        requestBodyType = await (0, json_schema_to_typescript_1.compile)(reqBodyScheme, `I${requestBodyTypeName}Data`, {
            bannerComment: '',
        });
    }
    const model = {
        type: ts,
        requestBodyType: requestBodyType.replace(/\[k: string\]: unknown;/g, ''),
        funcName,
        typeName,
        api: res.data.data,
        yapiDomain: domain,
        inputValues: [],
        mockCode,
        mockData,
        jsonData: resBodyJson,
        rawClipboardText: '',
        rawSelectedText: '',
    };
    return model;
};
function fixSchema(obj, fieldNames) {
    // eslint-disable-next-line no-restricted-syntax
    for (const key in obj) {
        if (Array.isArray(obj[key])) {
            obj[key].forEach((item) => {
                if (typeof item === 'object' && item !== null) {
                    fixSchema(item, fieldNames);
                }
                else {
                    // eslint-disable-next-line no-restricted-syntax
                    for (const fieldName of fieldNames) {
                        if (item && item[fieldName]) {
                            delete item[fieldName];
                        }
                    }
                }
            });
        }
        else if (typeof obj[key] === 'object' && obj[key] !== null) {
            if (obj[key].type === 'object' && !obj[key].properties) {
                delete obj[key];
            }
            fixSchema(obj[key], fieldNames);
        }
        else {
            // eslint-disable-next-line no-restricted-syntax
            for (const fieldName of fieldNames) {
                if (key === fieldName) {
                    delete obj[key];
                }
            }
        }
    }
}
