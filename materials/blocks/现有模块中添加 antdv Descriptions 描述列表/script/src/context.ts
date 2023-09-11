import { INestApplication } from '@nestjs/common';
import { CompileContext } from 'lowcode-context';
import { StatusBarItem } from 'vscode';

export const context: {
  lowcodeContext?: CompileContext;
  nestApp?: INestApplication<any>;
  statusBarItem?: StatusBarItem;
} = {
  lowcodeContext: undefined,
  nestApp: undefined,
  statusBarItem: undefined,
};
