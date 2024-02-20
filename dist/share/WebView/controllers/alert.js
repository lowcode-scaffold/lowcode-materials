"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const alert = {
    alert: (message) => {
        vscode_1.window.showErrorMessage(message.data);
        return '来自vscode的响应';
    },
};
exports.default = alert;
