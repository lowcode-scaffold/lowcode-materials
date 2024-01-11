import * as vscode from 'vscode';
import { CompileContext } from 'lowcode-context';
import { IMessage } from '../../../../../share/WebView/type';

export const getMaterialPath = async (
  message: IMessage<{
    materialPath: string;
    script: string;
    params: string;
  }>,
  context: {
    webview: vscode.Webview;
    task: { task: string; data?: any };
  } & CompileContext,
) => context.materialPath;
