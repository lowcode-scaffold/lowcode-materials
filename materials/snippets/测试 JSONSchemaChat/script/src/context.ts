import { ViewCallContext } from 'lowcode-context';
import { StatusBarItem } from 'vscode';

export const context: {
  lowcodeContext?: ViewCallContext;
  statusBarItem?: StatusBarItem;
} = {
  lowcodeContext: undefined,
  statusBarItem: undefined,
};
