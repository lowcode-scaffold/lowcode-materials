"use strict";
require('ts-node').register({
    transpileOnly: true,
    typeCheck: false,
    emit: false,
    compilerHost: false,
    cwd: __dirname, // 要输出编译后代码必须配置，否则会报错 EROFS: read-only file system, mkdir '/.ts-node'。不输出也要配置不然会出现各种奇奇怪怪的报错
});
const path = require('path');
// 清除缓存，保证每次修改代码后实时生效
delete require.cache[require.resolve(path.join(__dirname, 'handle.ts'))];
const Handler = require('./handle.ts');
module.exports = {
    beforeCompile: (context) => {
        const compileHandler = new Handler.CompileHandlerb9e78736b4ba410186eabffd9a749388(context);
        compileHandler.log('compile start');
    },
    afterCompile: (context) => {
        const compileHandler = new Handler.CompileHandlerb9e78736b4ba410186eabffd9a749388(context);
        compileHandler.log('compile end');
    },
    complete: (context) => {
        const compileHandler = new Handler.CompileHandlerb9e78736b4ba410186eabffd9a749388(context);
        compileHandler.updateModel();
        compileHandler.log('compile complete');
    },
    intFromOcrText: (context) => {
        const viewCallHandler = new Handler.ViewCallHandlerb9e78736b4ba410186eabffd9a749388(context);
        viewCallHandler.log('call method intFromOcrText');
        viewCallHandler.showInformationMessage('lowcode');
        return viewCallHandler.intFromOcrText();
    },
    test: (context) => ({ ...context.model, name: '测试一下' }),
};
