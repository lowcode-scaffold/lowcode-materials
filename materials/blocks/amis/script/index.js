require('ts-node').register({
	transpileOnly: false,
	emit: false,
	compilerHost: false, // 和 emit 一起设置为 true，会在 .ts-node 文件夹输出编译后的代码
	cwd: __dirname, // 要输出编译后代码必须配置，否则会报错 EROFS: read-only file system, mkdir '/.ts-node'。不输出也要配置不然会出现各种奇奇怪怪的报错
})
const path = require('path')
// 清除缓存，保证每次修改代码后实时生效
delete require.cache[require.resolve(path.join(__dirname, 'handle.ts'))]
const title = require('./handle.ts')
module.exports = {
	beforeCompile: context => {
		context.outputChannel.appendLine('compile amis start')
	},
	afterCompile: context => {
		context.outputChannel.appendLine('compile amis end')
	},
	IntFromOcrText: (context) => {
		context.outputChannel.appendLine(Object.keys(context))
		context.outputChannel.appendLine(JSON.stringify(context.model))
		context.outputChannel.appendLine(context.params)
		context.outputChannel.appendLine(title.getTitle('lowcode'))
		return { ...context.model, name: '测试一下' }
	},
}

// 以为 node.js 缓存机制，这个文件修改会事实更新（插件内做了处理），require 的模块会被缓存，修改后需要重新打开项目
