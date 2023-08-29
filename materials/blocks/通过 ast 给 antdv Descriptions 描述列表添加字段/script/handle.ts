import path from 'path';
import type vscode from 'vscode';
import * as typescriptParse from 'recast/parsers/typescript';
import * as recast from 'recast';
import fs from 'fs-extra';
import { visit, builders } from 'ast-types';
import { IdentifierKind } from 'ast-types/gen/kinds';

interface Context {
  /**
   * @description 模版数据
   * @type {object}
   */
  model: any;
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
    handleChunk?:
      | ((data: { text?: string; hasMore: boolean }) => void)
      | undefined;
  }) => Promise<string>;
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
}
interface CompileContext extends Context {
  /**
   * @description 代码片段编译后的代码
   * @type {string}
   */
  code: string;
}

interface ViewCallContext extends Context {
  /**
   * @description 传入的方法参数
   * @type {string}
   */
  params: string;
}

export class CompileHandlerb9e78736b4ba410186eabffd9a749388 {
  private context!: CompileContext;

  constructor(context: CompileContext) {
    this.context = context;
  }

  log(value: string) {
    this.context.outputChannel.appendLine(value);
  }

  updateModel() {
    const code = fs.readFileSync(
      path.join(this.context.createBlockPath!, 'model.ts'),
      'utf-8',
    );

    const ast = recast.parse(code, { parser: typescriptParse });
    const fieldName = 'name';
    const fieldType = 'string';

    visit(ast, {
      visitTSInterfaceDeclaration: (nodePath) => {
        const members = nodePath.node.body.body;
        if ((nodePath.node.id as IdentifierKind).name === 'IDetailInfo') {
          members.push(
            builders.tsPropertySignature(
              builders.identifier(fieldName),
              builders.tsTypeAnnotation(builders.tsStringKeyword()),
            ),
          );
        }
        return false;
      },
    });

    visit(ast, {
      visitVariableDeclaration(nodePath) {
        const declaration = nodePath.node.declarations[0];
        if (
          // @ts-ignore
          declaration.id.name === 'defaultFormData' &&
          // @ts-ignore
          declaration.init.type === 'ObjectExpression'
        ) {
          // @ts-ignore
          declaration.init.properties.push(
            builders.objectProperty(
              builders.identifier(fieldName),
              builders.stringLiteral(''),
            ),
          );
        }
        return false;
      },
    });

    const newCode = recast.print(ast).code;
    fs.writeFileSync(
      path.join(this.context.createBlockPath!, 'model.ts'),
      newCode,
    );
  }
}

export class ViewCallHandlerb9e78736b4ba410186eabffd9a749388 {
  private context!: ViewCallContext;

  constructor(context: ViewCallContext) {
    this.context = context;
  }

  log(value: string) {
    this.context.outputChannel.appendLine(value);
  }

  intFromOcrText() {
    return Promise.resolve({ ...this.context.model, name: '测试一下' });
  }
}
