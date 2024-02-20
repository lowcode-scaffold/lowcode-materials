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
exports.ViewCallHandlerb9e78736b4ba410186eabffd9a749388 = exports.CompileHandlerb9e78736b4ba410186eabffd9a749388 = void 0;
const path_1 = __importDefault(require("path"));
const typescriptParse = __importStar(require("recast/parsers/typescript"));
const recast = __importStar(require("recast"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const ast_types_1 = require("ast-types");
class CompileHandlerb9e78736b4ba410186eabffd9a749388 {
    context;
    constructor(context) {
        this.context = context;
    }
    log(value) {
        this.context.outputChannel.appendLine(value);
    }
    updateModel() {
        const code = fs_extra_1.default.readFileSync(path_1.default.join(this.context.createBlockPath, 'model.ts'), 'utf-8');
        const ast = recast.parse(code, { parser: typescriptParse });
        const fieldName = 'name';
        const fieldType = 'string';
        (0, ast_types_1.visit)(ast, {
            visitTSInterfaceDeclaration: (nodePath) => {
                const members = nodePath.node.body.body;
                if (nodePath.node.id.name === 'IDetailInfo') {
                    members.push(ast_types_1.builders.tsPropertySignature(ast_types_1.builders.identifier(fieldName), ast_types_1.builders.tsTypeAnnotation(ast_types_1.builders.tsStringKeyword())));
                }
                return false;
            },
        });
        (0, ast_types_1.visit)(ast, {
            visitVariableDeclaration(nodePath) {
                const declaration = nodePath.node.declarations[0];
                if (
                // @ts-ignore
                declaration.id.name === 'defaultFormData' &&
                    // @ts-ignore
                    declaration.init.type === 'ObjectExpression') {
                    // @ts-ignore
                    declaration.init.properties.push(ast_types_1.builders.objectProperty(ast_types_1.builders.identifier(fieldName), ast_types_1.builders.stringLiteral('')));
                }
                return false;
            },
        });
        const newCode = recast.print(ast).code;
        fs_extra_1.default.writeFileSync(path_1.default.join(this.context.createBlockPath, 'model.ts'), newCode);
    }
}
exports.CompileHandlerb9e78736b4ba410186eabffd9a749388 = CompileHandlerb9e78736b4ba410186eabffd9a749388;
class ViewCallHandlerb9e78736b4ba410186eabffd9a749388 {
    context;
    constructor(context) {
        this.context = context;
    }
    log(value) {
        this.context.outputChannel.appendLine(value);
    }
    intFromOcrText() {
        return Promise.resolve({ ...this.context.model, name: '测试一下' });
    }
}
exports.ViewCallHandlerb9e78736b4ba410186eabffd9a749388 = ViewCallHandlerb9e78736b4ba410186eabffd9a749388;
