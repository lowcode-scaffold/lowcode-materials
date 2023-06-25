const path = require("path");
module.exports = {
	beforeCompile: (context) => { },
	afterCompile: (context) => {
		context.outputChannel.appendLine("compile amis end");
	},
	test: (context) => {
		context.outputChannel.appendLine(Object.keys(context))
		context.outputChannel.appendLine(JSON.stringify(context.model))
		context.outputChannel.appendLine(context.params)
		return { ...context.model, name: "测试一下", }
	}
};