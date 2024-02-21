"use strict";
const main = require('../../../../dist/materials/blocks/通过 ast 给 antdv Descriptions 描述列表添加字段/script/src/main');
const { context, } = require('../../../../dist/materials/blocks/通过 ast 给 antdv Descriptions 描述列表添加字段/script/src/context');
module.exports = {
    beforeCompile: (context) => {
        const compileHandler = new main.CompileHandlerb9e78736b4ba410186eabffd9a749388(context);
        compileHandler.log('compile start');
    },
    afterCompile: (context) => {
        const compileHandler = new main.CompileHandlerb9e78736b4ba410186eabffd9a749388(context);
        compileHandler.log('compile end');
    },
    complete: (context) => {
        const compileHandler = new main.CompileHandlerb9e78736b4ba410186eabffd9a749388(context);
        compileHandler.updateModel();
        compileHandler.log('compile complete');
    },
    intFromOcrText: (context) => {
        const viewCallHandler = new main.ViewCallHandlerb9e78736b4ba410186eabffd9a749388(context);
        viewCallHandler.log('call method intFromOcrText');
        viewCallHandler.showInformationMessage('lowcode');
        return viewCallHandler.intFromOcrText();
    },
    test: (context) => ({ ...context.model, name: '测试一下' }),
};
