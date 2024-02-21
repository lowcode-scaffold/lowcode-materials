"use strict";
const main = require('../../../../dist/materials/snippets/生成 value-label 格式 JSON/script/src/main');
const { context, } = require('../../../../dist/materials/snippets/生成 value-label 格式 JSON/script/src/context');
module.exports = {
    beforeCompile: (lowcodeContext) => { },
    afterCompile: (lowcodeContext) => { },
    onSelect: async (lowcodeContext) => {
        context.lowcodeContext = lowcodeContext;
        await main.bootstrap();
    },
};
