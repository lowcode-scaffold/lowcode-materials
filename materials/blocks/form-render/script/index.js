const path = require("path");
module.exports = {
	beforeCompile: (context) => { },
	afterCompile: (context) => {
		context.outputChannel.appendLine("compile form-render end");
	},
	test: (context) => {
		context.outputChannel.appendLine(Object.keys(context))
		return { ...context.model, name: "测试一下", }
	}
};