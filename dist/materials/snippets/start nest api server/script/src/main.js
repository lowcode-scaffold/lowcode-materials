"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = void 0;
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const context_1 = require("./context");
async function bootstrap() {
    const lowcodeContext = context_1.context.lowcodeContext;
    if (!context_1.context.statusBarItem) {
        const statusBarItem = lowcodeContext.vscode.window.createStatusBarItem(lowcodeContext.vscode.StatusBarAlignment.Left);
        context_1.context.statusBarItem = statusBarItem;
    }
    if (!context_1.context.nestApp) {
        context_1.context.statusBarItem.text = '$(loading~spin) Start nest api server...';
        context_1.context.statusBarItem.show();
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        await app
            .listen(3000)
            .then(() => {
            context_1.context.nestApp = app;
            if (context_1.context.statusBarItem) {
                context_1.context.statusBarItem.text =
                    '$(circle-slash) Low Code Server Port : 3000';
                context_1.context.statusBarItem.tooltip = 'Click to close nest api server';
                // vscode 限制命令唯一，但是唯一的话命令回调里的 context 永远是同一个
                const command = `lowcode.StopNestApiServer${new Date().getTime()}`;
                try {
                    const dsisposable = lowcodeContext.vscode.commands.registerCommand(command, () => {
                        context_1.context.statusBarItem.text = '$(loading~spin) close...';
                        context_1.context.statusBarItem.command = undefined;
                        context_1.context.nestApp?.close().then(() => {
                            context_1.context.nestApp = undefined;
                            context_1.context.statusBarItem?.hide();
                            context_1.context.statusBarItem?.dispose();
                            context_1.context.statusBarItem = undefined;
                            dsisposable.dispose();
                        });
                    });
                }
                catch (ex) {
                    /* empty */
                }
                context_1.context.statusBarItem.command = command;
            }
        })
            .catch((ex) => {
            context_1.context.statusBarItem?.hide();
            context_1.context.statusBarItem?.dispose();
            context_1.context.statusBarItem = undefined;
            throw ex;
        });
    }
}
exports.bootstrap = bootstrap;
