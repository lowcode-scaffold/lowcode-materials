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
  context.statusBarItem.text = '$(loading~spin) Start nest api server...';
  context.statusBarItem.show();
  const app = await NestFactory.create(AppModule);
  await app.listen(3000).catch((ex) => {
    context.statusBarItem?.hide();
    context.statusBarItem?.dispose();
    context.statusBarItem = undefined;
    throw ex;
  });
  context.statusBarItem.text = '$(circle-slash) Port:3000';
  context.statusBarItem.tooltip = 'Click to close nest api server';
  lowcodeContext.vscode.commands.registerCommand(
    'lowcode.StopNestApiServer',
    () => {
      context.nestApp?.close();
      context.statusBarItem?.hide();
      context.statusBarItem?.dispose();
      context.statusBarItem = undefined;
    },
  );
  context.statusBarItem.command = 'lowcode.StopNestApiServer';
  context.nestApp = app;
}
