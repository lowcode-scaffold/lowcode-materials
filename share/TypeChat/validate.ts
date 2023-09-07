import * as ts from 'typescript';
import { Result, error, success } from './result';

export interface TypeChatJsonValidator<T extends object> {
  schema: string;
  typeName: string;
  stripNulls: boolean;
  createModuleTextFromJson(jsonObject: object): Result<string>;
  validate(jsonText: string): Result<T>;
}

const libText = `interface Array<T> { length: number, [n: number]: T }
interface Object { toString(): string }
interface Function { prototype: unknown }
interface CallableFunction extends Function {}
interface NewableFunction extends Function {}
interface String { readonly length: number }
interface Boolean { valueOf(): boolean }
interface Number { valueOf(): number }
interface RegExp { test(string: string): boolean }`;

export function createJsonValidator<T extends object = object>(
  schema: string,
  typeName: string,
): TypeChatJsonValidator<T> {
  const options: ts.CompilerOptions = {
    ...ts.getDefaultCompilerOptions(),
    strict: true,
    skipLibCheck: true,
    noLib: true,
    types: [],
  };

  const rootProgram = createProgramFromModuleText('');
  const validator: TypeChatJsonValidator<T> = {
    schema,
    typeName,
    stripNulls: false,
    createModuleTextFromJson,
    validate,
  };
  return validator;

  function validate(jsonText: string) {
    let jsonObject;
    try {
      jsonObject = JSON.parse(jsonText) as object;
    } catch (e) {
      return error(e instanceof SyntaxError ? e.message : 'JSON parse error');
    }
    if (validator.stripNulls) {
      stripNulls(jsonObject);
    }
    const moduleResult = validator.createModuleTextFromJson(jsonObject);
    if (!moduleResult.success) {
      return moduleResult;
    }
    const program = createProgramFromModuleText(moduleResult.data, rootProgram);
    const syntacticDiagnostics = program.getSyntacticDiagnostics();
    const programDiagnostics = syntacticDiagnostics.length
      ? syntacticDiagnostics
      : program.getSemanticDiagnostics();
    if (programDiagnostics.length) {
      const diagnostics = programDiagnostics
        .map((d) =>
          typeof d.messageText === 'string'
            ? d.messageText
            : d.messageText.messageText,
        )
        .join('\n');
      return error(diagnostics);
    }
    return success(jsonObject as T);
  }

  function createProgramFromModuleText(
    moduleText: string,
    oldProgram?: ts.Program,
  ) {
    const fileMap = new Map([
      createFileMapEntry('/lib.d.ts', libText),
      createFileMapEntry('/schema.ts', schema),
      createFileMapEntry('/json.ts', moduleText),
    ]);
    const host: ts.CompilerHost = {
      getSourceFile: (fileName) => fileMap.get(fileName),
      getDefaultLibFileName: () => 'lib.d.ts',
      writeFile: () => {},
      getCurrentDirectory: () => '/',
      getCanonicalFileName: (fileName) => fileName,
      useCaseSensitiveFileNames: () => true,
      getNewLine: () => '\n',
      fileExists: (fileName) => fileMap.has(fileName),
      readFile: (fileName) => '',
    };
    return ts.createProgram(
      Array.from(fileMap.keys()),
      options,
      host,
      oldProgram,
    );
  }

  function createModuleTextFromJson(jsonObject: object) {
    return success(
      `import { ${typeName} } from './schema';\nconst json: ${typeName} = ${JSON.stringify(
        jsonObject,
        undefined,
        2,
      )};\n`,
    );
  }

  function createFileMapEntry(
    filePath: string,
    fileText: string,
  ): [string, ts.SourceFile] {
    return [
      filePath,
      ts.createSourceFile(filePath, fileText, ts.ScriptTarget.Latest),
    ];
  }
}

function stripNulls(obj: any) {
  let keysToDelete: string[] | undefined;
  // eslint-disable-next-line no-restricted-syntax, guard-for-in
  for (const k in obj) {
    const value = obj[k];
    if (value === null) {
      (keysToDelete ??= []).push(k);
    } else {
      if (Array.isArray(value)) {
        if (value.some((x) => x === null)) {
          obj[k] = value.filter((x) => x !== null);
        }
      }
      if (typeof value === 'object') {
        stripNulls(value);
      }
    }
  }
  if (keysToDelete) {
    // eslint-disable-next-line no-restricted-syntax
    for (const k of keysToDelete) {
      delete obj[k];
    }
  }
}
