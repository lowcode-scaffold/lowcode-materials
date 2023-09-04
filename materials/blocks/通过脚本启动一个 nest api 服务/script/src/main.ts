import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { context } from './context';

export async function bootstrap() {
  const lowcodeContext = context.lowcodeContext!;
  if (!context.statusBarItem) {
    const statusBarItem = lowcodeContext.vscode.window.createStatusBarItem(
      lowcodeContext.vscode.StatusBarAlignment.Left,
    );
    context.statusBarItem = statusBarItem;
  }
  if (!context.nestApp) {
    context.statusBarItem.text = '$(loading~spin) Start nest api server...';
    context.statusBarItem.show();
    const app = await NestFactory.create(AppModule);
    await app
      .listen(3000)
      .then(() => {
        context.nestApp = app;
        if (context.statusBarItem) {
          context.statusBarItem.text =
            '$(circle-slash) Low Code Server Port : 3000';
          context.statusBarItem.tooltip = 'Click to close nest api server';
          // vscode 限制命令唯一，但是唯一的话命令回调里的 context 永远是同一个
          const command = `lowcode.StopNestApiServer${new Date().getTime()}`;
          try {
            const dsisposable = lowcodeContext.vscode.commands.registerCommand(
              command,
              () => {
                context.statusBarItem!.text = '$(loading~spin) close...';
                context.statusBarItem!.command = undefined;
                context.nestApp?.close().then(() => {
                  context.nestApp = undefined;
                  context.statusBarItem?.hide();
                  context.statusBarItem?.dispose();
                  context.statusBarItem = undefined;
                  dsisposable.dispose();
                });
              },
            );
          } catch (ex) {
            /* empty */
          }
          context.statusBarItem.command = command;
        }
      })
      .catch((ex) => {
        context.statusBarItem?.hide();
        context.statusBarItem?.dispose();
        context.statusBarItem = undefined;
        throw ex;
      });
  }
}
