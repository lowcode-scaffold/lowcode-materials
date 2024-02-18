import type vscode from 'vscode';

interface Context {
  /**
   * @description 模版数据
   * @type {object}
   */
  model: object;
  /**
   * @description vscode 对象，能调用 vscode 提供的 api
   * @type {typeof vscode}
   */
  vscode: typeof vscode;
  /**
   * @description 调用脚本的工作目录，不一定是脚本所在的项目目录
   * @type {string}
   */
  workspaceRootPath: string;
  /**
   * @description 区块生成目录
   * @type {string}
   */
  createBlockPath?: string;
  /**
   * @description OutputChannel
   * @type {vscode.OutputChannel}
   */
  outputChannel: vscode.OutputChannel;
  /**
   * @description log
   * @type {vscode.OutputChannel}
   */
  log: vscode.OutputChannel;
  /**
   * @description 调用 ChatGPT
   */
  createChatCompletion: (options: {
    messages: {
      role: 'system' | 'user' | 'assistant';
      content: string;
    }[];
    handleChunk?: ((data: { text?: string }) => void) | undefined;
    showWebview?: boolean;
  }) => Promise<string>;
  /**
   * @description 当前选择的物料路径(加上物料名称)
   * @type {string}
   */
  materialPath: string;
  /**
   * @description 一些环境变量
   */
  env: {
    /**
     * @description 等于 workspaceRootPath
     * @type {string}
     */
    rootPath: string;
    /**
     * @description 临时工作目录
     * @type {string}
     */
    tempWorkPath: string;
    /**
     * @description 物料路径
     * @type {string}
     */
    materialsPath: string;
    /**
     * @description 区块路径
     * @type {string}
     */
    blockMaterialsPath: string;
    /**
     * @description 代码片段路径
     * @type {string}
     */
    snippetMaterialsPath: string;
    /**
     * @description 私有物料路径
     * @type {string}
     */
    privateMaterialsPath: string;
    /**
     * @description ExtensionContext
     * @type {vscode.ExtensionContext}
     */
    extensionContext: vscode.ExtensionContext;
  };
  /**
   * @description lwocode 插件内部使用的一些库，暴露出来避免重复安装
   */
  libs: {
    /**
     * @description axios
     * @type {*}
     */
    axios: any;
    /**
     * @description copy-paste
     * @type {*}
     */
    copyPaste: any;
    /**
     * @description directory-tree
     * @type {*}
     */
    dirTree: any;
    /**
     * @description ejs
     * @type {*}
     */
    ejs: any;
    /**
     * @description fs-extra
     * @type {*}
     */
    fsExtra: any;
    /**
     * @description execa
     * @type {*}
     */
    execa: any;
    /**
     * @description glob
     * @type {*}
     */
    glob: any;
    /**
     * @description prettier
     * @type {*}
     */
    prettier: any;
    /**
     * @description strip-comments
     * @type {*}
     */
    stripComments: any;
    /**
     * @description strip-json-comments
     * @type {*}
     */
    stripJsonComments: any;
    /**
     * @description generate-schema
     * @type {*}
     */
    generateSchema: any;
    /**
     * @description json-schema-to-typescript
     * @type {*}
     */
    jsonSchemaToTypescript: any;
    /**
     * @description typescript-json-schema
     * @type {*}
     */
    typescriptJsonSchema: any;
    /**
     * @description axios
     * @type {*}
     */
    tar: any;
  };

  /**
   * 剪贴板的图片，执行脚本弹框里点击确定按钮的时候获取的，不通过 webview 获取不到
   */
  clipboardImage?: string;
  /**
   * 打开 webview 获取剪贴板里的图片，base64 格式
   */
  getClipboardImage: () => Promise<string | undefined>;
  /**
   * @description 最后一次激活的 TextEditor
   */
  activeTextEditor?: vscode.TextEditor;
}
export interface CompileContext extends Context {
  /**
   * @description 代码片段编译后的代码
   * @type {string}
   */
  code: string;
  /**
   * @description 执行右键菜单时选中的文件夹
   * @type {string}
   */
  explorerSelectedPath: string;
}

export interface ViewCallContext extends Context {
  /**
   * @description 传入的方法参数
   * @type {string}
   */
  params: string;
}
