import path from 'path';
import * as typescriptParse from 'recast/parsers/typescript';
import * as recast from 'recast';
import fs from 'fs-extra';
import { visit, builders } from 'ast-types';
import { IdentifierKind } from 'ast-types/gen/kinds';
import { CompileContext, ViewCallContext } from 'lowcode-context';

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
