"use strict";
const main = require('../../../../dist/materials/blocks/通过脚本启动一个 nest api 服务/script/src/main');
const { context, } = require('../../../../dist/materials/blocks/通过脚本启动一个 nest api 服务/script/src/context');
module.exports = {
    beforeCompile: (lowcodeContext) => { },
    afterCompile: (lowcodeContext) => { },
    startNestApiServer: async (lowcodeContext) => {
        context.lowcodeContext = lowcodeContext;
        await main.bootstrap();
        return { ...lowcodeContext.model };
    },
};
