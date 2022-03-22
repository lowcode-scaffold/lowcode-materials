module.exports = {
	beforeCompile: (context) => {
		console.log(context, 3333)
		context.vscode.window.showErrorMessage('12134')
		return { a: 'vbvbvbv' }
	},
	afterCompile: (constext) => {
		console.log(constext, 3333)
		console.log(__dirname, __filename, process.cwd())
	},
}
