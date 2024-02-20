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
exports.getMaterial = void 0;
const path = __importStar(require("path"));
const file_1 = require("./file");
const getMaterial = (materialPath) => {
    let material = {};
    try {
        const fullPath = path.join(materialPath);
        let model = {};
        let schema = {};
        let preview = {
            img: '',
            category: [],
            schema: 'form-render',
            chatGPT: { commandPrompt: '', viewPrompt: '' },
        };
        let template = '';
        let commandPrompt = '';
        let viewPrompt = '';
        try {
            model = JSON.parse((0, file_1.getFileContent)(path.join(fullPath, 'config', 'model.json'), true));
        }
        catch { }
        try {
            schema = JSON.parse((0, file_1.getFileContent)(path.join(fullPath, 'config', 'schema.json'), true));
        }
        catch { }
        try {
            preview = JSON.parse((0, file_1.getFileContent)(path.join(fullPath, 'config', 'preview.json'), true));
        }
        catch { }
        try {
            commandPrompt = (0, file_1.getFileContent)(path.join(fullPath, 'config', 'commandPrompt.ejs'), true);
        }
        catch { }
        try {
            viewPrompt = (0, file_1.getFileContent)(path.join(fullPath, 'config', 'viewPrompt.ejs'), true);
        }
        catch { }
        if (!preview.img) {
            preview.img =
                'https://gitee.com/img-host/img-host/raw/master/2020/11/05/1604587962875.jpg';
        }
        if (!preview.schema) {
            preview.schema = 'form-render';
        }
        try {
            template = (0, file_1.getFileContent)(path.join(fullPath, 'src', 'template.ejs'), true);
        }
        catch { }
        if (schema.formSchema) {
            if (schema.formSchema.formData) {
                model = schema.formSchema.formData;
            }
            schema = schema.formSchema.schema;
        }
        if (Object.keys(schema).length > 0 && preview.schema === 'amis') {
            // 设置 page 默认 name
            schema.name = 'page';
            if (schema.body && Array.isArray(schema.body)) {
                schema.body.forEach((s) => {
                    if (s.type === 'form') {
                        s.name = 'form';
                        if (s.data && Object.keys(model).length === 0) {
                            model = s.data;
                        }
                        else if (!s.data && Object.keys(model).length > 0) {
                            s.data = model;
                        }
                    }
                });
            }
        }
        material = {
            model,
            schema,
            preview,
            template,
            commandPrompt,
            viewPrompt,
        };
    }
    catch { }
    return material;
};
exports.getMaterial = getMaterial;
