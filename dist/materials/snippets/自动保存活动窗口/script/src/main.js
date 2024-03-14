"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onActivate = void 0;
const vscode_1 = require("vscode");
const shareData_1 = require("../../../../../share/utils/shareData");
function onActivate() {
    (0, shareData_1.saveShareData)({
        activeWindow: (vscode_1.workspace.workspaceFolders && vscode_1.workspace.workspaceFolders[0].uri.path) ||
            '',
    });
    vscode_1.window.onDidChangeWindowState((state) => {
        if (state.focused) {
            (0, shareData_1.saveShareData)({
                activeWindow: (vscode_1.workspace.workspaceFolders &&
                    vscode_1.workspace.workspaceFolders[0].uri.path) ||
                    '',
            });
        }
    });
}
exports.onActivate = onActivate;
