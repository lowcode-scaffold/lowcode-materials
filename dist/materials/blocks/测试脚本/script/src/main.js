"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewCallHandler3c5a281f3af548fda73cb864dd8f452b = exports.CompileHandler3c5a281f3af548fda73cb864dd8f452b = void 0;
class CompileHandler3c5a281f3af548fda73cb864dd8f452b {
    context;
    constructor(context) {
        this.context = context;
    }
    log(value) {
        this.context.outputChannel.appendLine(value);
    }
}
exports.CompileHandler3c5a281f3af548fda73cb864dd8f452b = CompileHandler3c5a281f3af548fda73cb864dd8f452b;
class ViewCallHandler3c5a281f3af548fda73cb864dd8f452b {
    context;
    constructor(context) {
        this.context = context;
    }
    log(value) {
        this.context.outputChannel.appendLine(value);
    }
    showInformationMessage(msg) {
        this.context.vscode.window.showInformationMessage(msg);
    }
    intFromOcrText() {
        return Promise.resolve({ ...this.context.model, name: '测试一下' });
    }
    async askChatGPT() {
        const res = await this.context.createChatCompletion({
            messages: [{ role: 'user', content: this.context.params }],
            handleChunk: (data) => {
                this.context.outputChannel.append(data.text || '');
            },
        });
        return { ...this.context.model, name: res };
    }
}
exports.ViewCallHandler3c5a281f3af548fda73cb864dd8f452b = ViewCallHandler3c5a281f3af548fda73cb864dd8f452b;
