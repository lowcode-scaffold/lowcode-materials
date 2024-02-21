"use strict";
const main = require('../../../../dist/materials/blocks/现有模块中添加 antdv Form 表单/script/src/main');
const { context, } = require('../../../../dist/materials/blocks/现有模块中添加 antdv Form 表单/script/src/context');
module.exports = {
    beforeCompile: (lowcodeContext) => { },
    afterCompile: (lowcodeContext) => { },
    complete: (lowcodeContext) => {
        context.lowcodeContext = lowcodeContext;
        main.handleComplete();
    },
    initFromOcrText: (lowcodeContext) => {
        let formItems = lowcodeContext.params.split('\n');
        formItems = formItems.map((s) => ({
            key: s.split(/:|：/g)[0],
            label: s.split(/:|：/g)[0],
            placeholder: s.split(/:|：/g)[1],
        }));
        return { ...lowcodeContext.model, formItems };
    },
    askChatGPT: async (lowcodeContext) => {
        const statusBarItem = lowcodeContext.vscode.window.createStatusBarItem(lowcodeContext.vscode.StatusBarAlignment.Left);
        statusBarItem.text = '$(sync~spin) Ask ChatGPT...';
        statusBarItem.show();
        const res = await lowcodeContext.createChatCompletion({
            messages: [
                {
                    role: 'system',
                    content: `你是一个严谨的代码机器人，严格按照用户的要求处理问题`,
                },
                {
                    role: 'user',
                    content: `${JSON.stringify(lowcodeContext.model)} 将这段 JSON 中 formItems 字段里的 key 字段的值翻译成英文，驼峰格式，返回翻译后的JSON，不要带其他无关的内容，并且返回的结果使用 JSON.parse 不会报错`,
                },
            ],
            handleChunk: (data) => {
                lowcodeContext.outputChannel.append(data.text || '');
            },
        });
        statusBarItem.hide();
        statusBarItem.dispose();
        lowcodeContext.outputChannel.appendLine(res);
        return { ...lowcodeContext.model, ...JSON.parse(res) };
    },
};
