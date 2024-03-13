"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = void 0;
const vscode_1 = require("vscode");
async function bootstrap() {
    vscode_1.window.onDidChangeWindowState((state) => {
        console.log(state.focused, 123);
    });
}
exports.bootstrap = bootstrap;
