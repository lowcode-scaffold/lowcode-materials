import * as ts from 'typescript';
import { StatusBarAlignment, window } from 'vscode';
import { error, success } from './result';

const libText = `interface Array<T> { length: number, [n: number]: T }
interface Object { toString(): string }
interface Function { prototype: unknown }
interface CallableFunction extends Function {}
interface NewableFunction extends Function {}
interface String { readonly length: number }
interface Boolean { valueOf(): boolean }
interface Number { valueOf(): number }
interface RegExp { test(string: string): boolean }`;

export async function translate<T extends object>(option: {
  schema: string;
  typeName: string;
  request: string;
  createChatCompletion: (options: {
    messages: {
      role: 'system' | 'user' | 'assistant';
      content: string;
    }[];
    handleChunk?:
      | ((data: { text?: string; hasMore: boolean }) => void)
      | undefined;
  }) => Promise<string>;
}) {
  let requestPrompt =
    `You are a service that translates user requests into JSON objects of type "${option.typeName}" according to the following TypeScript definitions:\n` +
    `\`\`\`\n${option.schema}\`\`\`\n` +
    `The following is a user request:\n` +
    `"""\n${option.request}\n"""\n` +
    `The following is the user request translated into a JSON object with 2 spaces of indentation and no properties with the value undefined:\n`;

  // eslint-disable-next-line no-unreachable-loop, no-constant-condition
  while (true) {
    const statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
    statusBarItem.text = '$(sync~spin) Ask ChatGPT...';
    statusBarItem.show();
    // eslint-disable-next-line no-await-in-loop
    const responseText = await option
      .createChatCompletion({
        messages: [{ role: 'user', content: requestPrompt }],
        handleChunk: undefined,
      })
      .finally(() => {
        statusBarItem.hide();
        statusBarItem.dispose();
      });
    console.log(responseText);
    const startIndex = responseText.indexOf('{');
    const endIndex = responseText.lastIndexOf('}');
    if (!(startIndex >= 0 && endIndex > startIndex)) {
      return error(`Response is not JSON:\n${responseText}`);
    }
    const jsonText = responseText.slice(startIndex, endIndex + 1);
    const validation = validate<T>(jsonText, option.schema, option.typeName);
    if (validation.success) {
      return validation;
    }
    console.log(validation);
    requestPrompt += `${responseText}\n${createRepairPrompt(
      validation.message,
    )}`;
  }
}

function createRepairPrompt(validationError: string) {
  return (
    `The JSON object is invalid for the following reason:\n` +
    `"""\n${validationError}\n"""\n` +
    `The following is a revised JSON object:\n`
  );
}

function validate<T extends object>(
  jsonText: string,
  schema: string,
  typeName: string,
) {
  let jsonObject;
  try {
    jsonObject = JSON.parse(jsonText) as object;
  } catch (e) {
    return error(e instanceof SyntaxError ? e.message : 'JSON parse error');
  }
  stripNulls(jsonObject);
  const moduleResult = `import { ${typeName} } from './schema';\nconst json: ${typeName} = ${JSON.stringify(
    jsonObject,
    undefined,
    2,
  )};\n`;

  const program = createProgramFromModuleText({
    moduleText: moduleResult,
    schema,
  });
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
  return success<T>(jsonObject);
}

function createProgramFromModuleText(option: {
  moduleText: string;
  oldProgram?: ts.Program;
  schema: string;
}) {
  const fileMap = new Map([
    createFileMapEntry('/lib.d.ts', libText),
    createFileMapEntry('/schema.ts', option.schema),
    createFileMapEntry('/json.ts', option.moduleText),
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
  const options: ts.CompilerOptions = {
    ...ts.getDefaultCompilerOptions(),
    strict: true,
    skipLibCheck: true,
    noLib: true,
    types: [],
  };
  return ts.createProgram(
    Array.from(fileMap.keys()),
    options,
    host,
    option.oldProgram,
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
