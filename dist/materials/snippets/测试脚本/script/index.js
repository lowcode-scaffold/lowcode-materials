"use strict";
module.exports = {
    beforeCompile: (context) => {
        context.outputChannel.appendLine(Object.keys(context));
        context.vscode.window.showErrorMessage('12134');
        return { a: 'lowcode' };
    },
    afterCompile: (context) => {
        context.outputChannel.appendLine(Object.keys(context));
    },
    onSelect: async (lowcodeContext) => {
        const res = await lowcodeContext.getClipboardImage();
        console.log(res.length, 6767);
    },
};
