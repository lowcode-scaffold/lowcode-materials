"use strict";
require('ts-node').register({
    transpileOnly: true,
    typeCheck: false,
    emit: false,
    compilerHost: false,
    cwd: __dirname, // 要输出编译后代码必须配置，否则会报错 EROFS: read-only file system, mkdir '/.ts-node'。不输出也要配置不然会出现各种奇奇怪怪的报错
});
const path = require('path');
// 清除缓存，保证每次修改代码后实时生效，否则要重新打开 vscode
const { clearCache } = require('../../../../share/clearCache.ts');
clearCache(__dirname); // 调试的时候才打开，不然会很慢
const main = require('./src/main.ts');
const { context } = require('./src/context.ts');
module.exports = {
    beforeCompile: (lowcodeContext) => { },
    afterCompile: (lowcodeContext) => {
        lowcodeContext.outputChannel.appendLine(__dirname);
        lowcodeContext.outputChannel.appendLine(__filename);
        lowcodeContext.outputChannel.appendLine(process.cwd());
        lowcodeContext.outputChannel.appendLine(JSON.stringify(lowcodeContext.model));
        if (!lowcodeContext.model.includeModifyModal) {
            lowcodeContext.libs.fsExtra.removeSync(path.join(path.join(lowcodeContext.env.tempWorkPath, 'src', 'ModifyModal')));
        }
    },
    complete: (lowcodeContext) => {
        context.lowcodeContext = lowcodeContext;
        try {
            main.handleComplete();
        }
        catch (ex) { }
    },
    initFiltersFromImage: async (lowcodeContext) => {
        context.lowcodeContext = lowcodeContext;
        const res = await main.handleInitFiltersFromImage();
        return res;
    },
    initFiltersFromText: (lowcodeContext) => {
        // 处理如下 ocr 结果
        // 客户姓名：
        // 请输入
        // 手机号：
        // 全部
        // 合同编号：
        // 全部
        // 变更单状态：
        // 请选择
        let filters = lowcodeContext.params
            .split('\n')
            .reduce((result, value, index, array) => {
            if (index % 2 === 0) {
                result.push(array.slice(index, index + 2));
            }
            return result;
        }, []);
        filters = filters.map((s) => ({
            component: s[1].indexOf('选择') > -1 ? 'select' : 'input',
            key: s[0].replace(/:|：/g, '').trim(),
            label: s[0].replace(/:|：/g, '').trim(),
            placeholder: s[1],
        }));
        lowcodeContext.outputChannel.appendLine(JSON.stringify(filters));
        return { ...lowcodeContext.model, filters };
    },
    initColumnsFromImage: async (lowcodeContext) => {
        context.lowcodeContext = lowcodeContext;
        const res = await main.handleInitColumnsFromImage();
        return res;
    },
    initColumnsFromText: (lowcodeContext) => {
        let columns = lowcodeContext.params.split('\n');
        columns = columns.map((s) => ({
            slot: false,
            title: s,
            dataIndex: s,
            key: s,
        }));
        lowcodeContext.outputChannel.appendLine(JSON.stringify(columns));
        return { ...lowcodeContext.model, columns };
    },
    askChatGPT: async (lowcodeContext) => {
        context.lowcodeContext = lowcodeContext;
        const res = await main.handleAskChatGPT();
        return res;
    },
};
