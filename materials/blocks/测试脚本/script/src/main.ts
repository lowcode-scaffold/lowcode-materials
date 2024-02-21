import { CompileContext, ViewCallContext } from 'lowcode-context';

export class CompileHandler3c5a281f3af548fda73cb864dd8f452b {
  private context!: CompileContext;

  constructor(context: CompileContext) {
    this.context = context;
  }

  log(value: string) {
    this.context.outputChannel.appendLine(value);
  }
}

export class ViewCallHandler3c5a281f3af548fda73cb864dd8f452b {
  private context!: ViewCallContext;

  constructor(context: ViewCallContext) {
    this.context = context;
  }

  log(value: string) {
    this.context.outputChannel.appendLine(value);
  }

  showInformationMessage(msg: string) {
    this.context.vscode.window.showInformationMessage(msg);
  }

  intFromOcrText() {
    return Promise.resolve({ ...this.context.model, name: '测试一下' });
  }

  async askChatGPT() {
    const res = await this.context.createChatCompletion({
      messages: [{ role: 'user', content: this.context.params }],
      handleChunk: (data) => {
        this.context.outputChannel.append(data.text || '');
      },
    });
    return { ...this.context.model, name: res };
  }
}
