import { INestApplication } from '@nestjs/common';
import { ViewCallContext } from 'lowcode-context';
import { StatusBarItem } from 'vscode';

export const context: {
  lowcodeContext?: ViewCallContext;
  nestApp?: INestApplication<any>;
  statusBarItem?: StatusBarItem;
} = {
  lowcodeContext: undefined,
  nestApp: undefined,
  statusBarItem: undefined,
};
