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
exports.renderTemplates = void 0;
const path = __importStar(require("path"));
const html_entities_1 = require("html-entities");
const ReactDOMServer = __importStar(require("react-dom/server"));
const glob_1 = __importDefault(require("glob"));
const fse = __importStar(require("fs-extra"));
const typescript_1 = __importDefault(require("typescript"));
async function renderTemplates(props, templateDir) {
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
                if (s.indexOf('.template.tsx') < 0) {
                    valid = false;
                }
                return valid;
            });
            Promise.all(templateFiles.map((file) => {
                const filepath = path.join(templateDir, file);
                return renderFile(filepath, props);
            }))
                .then(() => resolve())
                .catch(reject);
        });
    });
}
exports.renderTemplates = renderTemplates;
async function renderFile(templateFilepath, props) {
    const tsxContentStr = fse.readFileSync(templateFilepath).toString();
    const transpileResult = typescript_1.default.transpileModule(tsxContentStr, {
        compilerOptions: {
            jsx: typescript_1.default.JsxEmit.React,
            module: typescript_1.default.ModuleKind.ES2015,
            strict: false,
            moduleResolution: typescript_1.default.ModuleResolutionKind.NodeNext,
            target: typescript_1.default.ScriptTarget.ES2015,
        },
    });
    fse.writeFileSync(path.join(templateFilepath), transpileResult.outputText);
    const templateJsFilepath = templateFilepath.replace(/\.template.tsx$/, '.template.js');
    await fse.rename(templateFilepath, templateJsFilepath);
    delete require.cache[require.resolve(templateJsFilepath)];
    const script = require(templateJsFilepath);
    const markup = ReactDOMServer.renderToStaticMarkup(script.default(props));
    const targetFilePath = templateJsFilepath
        .replace(/\.template.js$/, '')
        .replace(/\$\{.+?\}/gi, (match) => props[match.replace(/\$|\{|\}/g, '')] || '');
    await fse.rename(templateJsFilepath, targetFilePath);
    await fse.writeFile(targetFilePath, (0, html_entities_1.decode)(markup));
}
