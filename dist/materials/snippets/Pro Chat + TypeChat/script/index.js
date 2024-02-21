"use strict";
const main = require('../../../../dist/materials/snippets/Pro Chat + TypeChat/script/src/main');
const { context, } = require('../../../../dist/materials/snippets/Pro Chat + TypeChat/script/src/context');
module.exports = {
    beforeCompile: (lowcodeContext) => { },
    afterCompile: (lowcodeContext) => { },
    onSelect: async (lowcodeContext) => {
        context.lowcodeContext = lowcodeContext;
        await main.bootstrap();
    },
};
