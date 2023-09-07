/* eslint-disable no-restricted-syntax */
/* eslint-disable no-return-await */
/* eslint-disable no-prototype-builtins */
import { Program } from 'typescript';
import { Result, error, success } from './result';
import { TypeChatJsonTranslator, createJsonTranslator } from './typechat';

export function createModuleTextFromProgram(
  jsonObject: object,
): Result<string> {
  const steps = (jsonObject as Program)['@steps'];
  if (
    !(
      Array.isArray(steps) &&
      steps.every(
        (step) =>
          typeof step === 'object' &&
          step !== null &&
          step.hasOwnProperty('@func'),
      )
    )
  ) {
    return error('JSON object is not a valid program');
  }

  let hasError = false;
  let functionBody = '';
  let currentStep = 0;
  while (currentStep < steps.length) {
    functionBody += `  ${
      currentStep === steps.length - 1
        ? `return`
        : `const step${currentStep + 1} =`
    } ${exprToString(steps[currentStep])};\n`;
    currentStep++;
  }
  return hasError
    ? error('JSON program contains an invalid expression')
    : success(
        `import { API } from "./schema";\nfunction program(api: API) {\n${functionBody}}`,
      );

  function exprToString(expr: unknown): string {
    return typeof expr === 'object' && expr !== null
      ? objectToString(expr as Record<string, unknown>)
      : JSON.stringify(expr);
  }

  function objectToString(obj: Record<string, unknown>) {
    if (obj.hasOwnProperty('@ref')) {
      const index = obj['@ref'];
      if (
        typeof index === 'number' &&
        index < currentStep &&
        Object.keys(obj).length === 1
      ) {
        return `step${index + 1}`;
      }
    } else if (obj.hasOwnProperty('@func')) {
      const func = obj['@func'];
      const hasArgs = obj.hasOwnProperty('@args');
      const args = hasArgs ? obj['@args'] : [];
      if (
        typeof func === 'string' &&
        Array.isArray(args) &&
        Object.keys(obj).length === (hasArgs ? 2 : 1)
      ) {
        return `api.${func}(${arrayToString(args)})`;
      }
    } else if (Array.isArray(obj)) {
      return `[${arrayToString(obj)}]`;
    } else {
      return `{ ${Object.keys(obj)
        .map((key) => `${JSON.stringify(key)}: ${exprToString(obj[key])}`)
        .join(', ')} }`;
    }
    hasError = true;
    return '';
  }

  function arrayToString(array: unknown[]) {
    return array.map(exprToString).join(', ');
  }
}

export async function evaluateJsonProgram(
  program: Program,
  onCall: (func: string, args: unknown[]) => Promise<unknown>,
) {
  const results: unknown[] = [];
  for (const expr of program['@steps']) {
    // eslint-disable-next-line no-await-in-loop
    results.push(await evaluate(expr));
  }
  return results.length > 0 ? results[results.length - 1] : undefined;

  async function evaluate(expr: unknown): Promise<unknown> {
    return typeof expr === 'object' && expr !== null
      ? await evaluateObject(expr as Record<string, unknown>)
      : expr;
  }

  async function evaluateObject(obj: Record<string, unknown>) {
    if (obj.hasOwnProperty('@ref')) {
      const index = obj['@ref'];
      if (typeof index === 'number' && index < results.length) {
        return results[index];
      }
    } else if (obj.hasOwnProperty('@func')) {
      const func = obj['@func'];
      const args = obj.hasOwnProperty('@args') ? obj['@args'] : [];
      if (typeof func === 'string' && Array.isArray(args)) {
        return await onCall(func, await evaluateArray(args));
      }
    } else if (Array.isArray(obj)) {
      return evaluateArray(obj);
    } else {
      const values = await Promise.all(Object.values(obj).map(evaluate));
      return Object.fromEntries(Object.keys(obj).map((k, i) => [k, values[i]]));
    }
  }

  function evaluateArray(array: unknown[]) {
    return Promise.all(array.map(evaluate));
  }
}

const programSchemaText = `// A program consists of a sequence of function calls that are evaluated in order.
export type Program = {
    "@steps": FunctionCall[];
}

// A function call specifies a function name and a list of argument expressions. Arguments may contain
// nested function calls and result references.
export type FunctionCall = {
    // Name of the function
    "@func": string;
    // Arguments for the function, if any
    "@args"?: Expression[];
};

// An expression is a JSON value, a function call, or a reference to the result of a preceding expression.
export type Expression = JsonValue | FunctionCall | ResultReference;

// A JSON value is a string, a number, a boolean, null, an object, or an array. Function calls and result
// references can be nested in objects and arrays.
export type JsonValue = string | number | boolean | null | { [x: string]: Expression } | Expression[];

// A result reference represents the value of an expression from a preceding step.
export type ResultReference = {
    // Index of the previous expression in the "@steps" array
    "@ref": number;
};
`;
export function createProgramTranslator(
  schema: string,
): TypeChatJsonTranslator<Program> {
  const translator = createJsonTranslator<Program>(schema, 'Program');
  translator.validator.createModuleTextFromJson = createModuleTextFromProgram;
  translator.createRequestPrompt = createRequestPrompt;
  translator.createRepairPrompt = createRepairPrompt;
  return translator;

  function createRequestPrompt(request: string) {
    return (
      `You are a service that translates user requests into programs represented as JSON using the following TypeScript definitions:\n` +
      `\`\`\`\n${programSchemaText}\`\`\`\n` +
      `The programs can call functions from the API defined in the following TypeScript definitions:\n` +
      `\`\`\`\n${translator.validator.schema}\`\`\`\n` +
      `The following is a user request:\n` +
      `"""\n${request}\n"""\n` +
      `The following is the user request translated into a JSON program object with 2 spaces of indentation and no properties with the value undefined:\n`
    );
  }

  function createRepairPrompt(validationError: string) {
    return (
      `The JSON program object is invalid for the following reason:\n` +
      `"""\n${validationError}\n"""\n` +
      `The following is a revised JSON program object:\n`
    );
  }
}
