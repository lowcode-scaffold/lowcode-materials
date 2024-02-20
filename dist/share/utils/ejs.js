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
exports.renderEjsTemplates = exports.compile = void 0;
const path = __importStar(require("path"));
const ejs = __importStar(require("ejs"));
const glob_1 = __importDefault(require("glob"));
const fse = __importStar(require("fs-extra"));
const compile = (templateString, model) => ejs.render(templateString, model);
exports.compile = compile;
async function renderEjsTemplates(templateData, templateDir) {
    return new Promise((resolve, reject) => {
        (0, glob_1.default)('**', {
            cwd: templateDir,
            ignore: ['node_modules/**'],
            nodir: true,
            dot: true,
        }, (err, files) => {
            if (err) {
                return reject(err);
            }
            const templateFiles = files.filter((s) => {
                let valid = true;
                if (s.indexOf('.ejs') < 0) {
                    valid = false;
                }
                return valid;
            });
            Promise.all(templateFiles.map((file) => {
                const filepath = path.join(templateDir, file);
                return renderFile(filepath, templateData);
            }))
                .then(() => resolve())
                .catch(reject);
        });
    });
}
exports.renderEjsTemplates = renderEjsTemplates;
async function renderFile(templateFilepath, data) {
    const content = await ejs.renderFile(templateFilepath, data);
    const targetFilePath = templateFilepath
        .replace(/\.ejs$/, '')
        .replace(/\$\{.+?\}/gi, (match) => data[match.replace(/\$|\{|\}/g, '')] || '');
    await fse.rename(templateFilepath, targetFilePath);
    await fse.writeFile(targetFilePath, content);
}
