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
    await app.listen(3000).catch((ex) => {
      context.statusBarItem?.hide();
      context.statusBarItem?.dispose();
      context.statusBarItem = undefined;
      throw ex;
    });
    context.nestApp = app;
  }
  context.statusBarItem.text = '$(circle-slash) Low Code Server Port : 3000';
  context.statusBarItem.tooltip = 'Click to close nest api server';
  try {
    // 重复注册报错
    lowcodeContext.vscode.commands.registerCommand(
      'lowcode.StopNestApiServer',
      () => {
        context.statusBarItem!.text = '$(loading~spin) close...';
        context.statusBarItem!.command = undefined;
        context.nestApp?.close().then(() => {
          context.nestApp = undefined;
          context.statusBarItem?.hide();
          context.statusBarItem?.dispose();
          context.statusBarItem = undefined;
        });
      },
    );
  } catch (ex) {
    /* empty */
  }
  context.statusBarItem.command = 'lowcode.StopNestApiServer';
}
