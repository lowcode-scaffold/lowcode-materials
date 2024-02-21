"use strict";
const main = require('../../../../dist/materials/snippets/翻译成驼峰格式/script/src/main');
const { context, } = require('../../../../dist/materials/snippets/翻译成驼峰格式/script/src/context');
module.exports = {
    beforeCompile: (lowcodeContext) => { },
    afterCompile: (lowcodeContext) => { },
    onSelect: async (lowcodeContext) => {
        context.lowcodeContext = lowcodeContext;
        await main.bootstrap();
    },
};
