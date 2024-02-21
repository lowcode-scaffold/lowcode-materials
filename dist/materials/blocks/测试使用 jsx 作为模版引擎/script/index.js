"use strict";
const main = require('../../../../dist/materials/blocks/测试使用 jsx 作为模版引擎/script/src/main');
const { context, } = require('../../../../dist/materials/blocks/测试使用 jsx 作为模版引擎/script/src/context');
module.exports = {
    beforeCompile: (lowcodeContext) => { },
    afterCompile: async (lowcodeContext) => {
        context.lowcodeContext = lowcodeContext;
        try {
            await main.handleAfterCompile();
        }
        catch (ex) {
            console.log(ex);
        }
    },
    complete: async (lowcodeContext) => {
        context.lowcodeContext = lowcodeContext;
        try {
            await main.handleComplete();
        }
        catch (ex) {
            console.log(ex);
        }
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
