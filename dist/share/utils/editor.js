"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFuncNameAndTypeName = exports.insertSnippet = exports.pasteToEditor = exports.getSelectedText = void 0;
const vscode_1 = require("vscode");
const getSelectedText = () => {
    const { selection, document } = vscode_1.window.activeTextEditor;
    return document.getText(selection).trim();
};
exports.getSelectedText = getSelectedText;
const pasteToEditor = (content, isInsertSnippet = true) => {
    // vscode 本身代码片段语法
    if (isInsertSnippet) {
        return (0, exports.insertSnippet)(content);
    }
    const { activeTextEditor } = vscode_1.window;
    if (activeTextEditor === undefined) {
        throw new Error('无打开文件');
    }
    return activeTextEditor?.edit((editBuilder) => {
        // editBuilder.replace(activeTextEditor.selection, content);
        if (activeTextEditor.selection.isEmpty) {
            editBuilder.insert(activeTextEditor.selection.start, content);
        }
        else {
            editBuilder.replace(new vscode_1.Range(activeTextEditor.selection.start, activeTextEditor.selection.end), content);
        }
    });
};
exports.pasteToEditor = pasteToEditor;
const insertSnippet = (content) => {
    const { activeTextEditor } = vscode_1.window;
    if (activeTextEditor === undefined) {
        throw new Error('无打开文件');
    }
    return activeTextEditor.insertSnippet(new vscode_1.SnippetString(content));
};
exports.insertSnippet = insertSnippet;
const getFuncNameAndTypeName = () => {
    // 这部分代码可以写在模版里，暂时保留
    const selectedText = (0, exports.getSelectedText)() || '';
    let funcName = 'fetch';
    let typeName = 'IFetchResult';
    if (selectedText) {
        const splitValue = selectedText.split(' ');
        funcName = splitValue[0] || funcName;
        if (splitValue.length > 1 && splitValue[1]) {
            // eslint-disable-next-line prefer-destructuring
            typeName = splitValue[1];
        }
        else {
            typeName = `I${funcName.charAt(0).toUpperCase() + funcName.slice(1)}Result`;
        }
    }
    return {
        funcName,
        typeName,
        rawSelectedText: selectedText,
    };
};
exports.getFuncNameAndTypeName = getFuncNameAndTypeName;
