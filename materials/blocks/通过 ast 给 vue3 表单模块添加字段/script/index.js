const path = require("path");
module.exports = {
  beforeCompile: (context) => {
		context.outputChannel.appendLine("compile 通过 ast 给 vue3 表单模块添加字段 start");
	},
	afterCompile: (context) => {
		context.outputChannel.appendLine("compile 通过 ast 给 vue3 表单模块添加字段 end");
	},
	test: (context) => {
		context.outputChannel.appendLine(Object.keys(context))
		context.outputChannel.appendLine(JSON.stringify(context.model))
		context.outputChannel.appendLine(context.params)
		return { ...context.model, name: "测试一下", }
	},
};