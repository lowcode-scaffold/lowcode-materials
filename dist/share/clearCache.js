"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCache = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const clearCache = (path, clearShare = true) => {
    getAllFiles(path).forEach((file) => {
        if (!file.includes('script/index.js')) {
            delete require.cache[require.resolve(file)];
        }
    });
    if (clearShare) {
        getAllFiles(__dirname).forEach((file) => {
            if (!file.includes('clearCache')) {
                delete require.cache[require.resolve(file)];
            }
        });
    }
};
exports.clearCache = clearCache;
// 递归获取文件夹下的所有文件
function getAllFiles(dirPath) {
    const files = fs_extra_1.default.readdirSync(dirPath);
    let result = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const file of files) {
        const filePath = `${dirPath}/${file}`;
        // eslint-disable-next-line no-await-in-loop
        const stats = fs_extra_1.default.statSync(filePath);
        if (stats.isDirectory()) {
            result = result.concat(getAllFiles(filePath));
        }
        else {
            result.push(filePath);
        }
    }
    return result;
}
