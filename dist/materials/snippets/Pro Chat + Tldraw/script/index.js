"use strict";
const main = require('../../../../dist/materials/snippets/Pro Chat + Tldraw/script/src/main');
const { context, } = require('../../../../dist/materials/snippets/Pro Chat + Tldraw/script/src/context');
module.exports = {
    beforeCompile: (lowcodeContext) => { },
    afterCompile: (lowcodeContext) => { },
    onSelect: async (lowcodeContext) => {
        context.lowcodeContext = lowcodeContext;
        await main.bootstrap();
    },
};
