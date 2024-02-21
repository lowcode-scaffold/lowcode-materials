"use strict";
const main = require('../../../../dist/materials/snippets/测试 JSONSchemaChat/script/src/main');
const { context, } = require('../../../../dist/materials/snippets/测试 JSONSchemaChat/script/src/context');
module.exports = {
    beforeCompile: (lowcodeContext) => { },
    afterCompile: (lowcodeContext) => { },
    onSelect: async (lowcodeContext) => {
        context.lowcodeContext = lowcodeContext;
        await main.bootstrap();
    },
};
