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
exports.lint = void 0;
const path = __importStar(require("path"));
const glob_1 = __importDefault(require("glob"));
const execa = __importStar(require("execa"));
async function lint(option) {
    const { createBlockPath, rootPath } = option;
    return new Promise((resolve, reject) => {
        (0, glob_1.default)('**', {
            cwd: createBlockPath,
            ignore: ['node_modules/**'],
            nodir: true,
            dot: true,
        }, (err, files) => {
            if (err) {
                return reject(err);
            }
            Promise.all(files.map((file) => {
                try {
                    execa.sync('node', [
                        path.join(rootPath, '/node_modules/eslint/bin/eslint.js'),
                        path.join(createBlockPath, file),
                        '--resolve-plugins-relative-to',
                        rootPath,
                        '--fix',
                    ]);
                }
                catch (e) {
                    console.log(e);
                }
            }))
                .then(() => resolve())
                .catch(reject);
        });
    });
}
exports.lint = lint;
