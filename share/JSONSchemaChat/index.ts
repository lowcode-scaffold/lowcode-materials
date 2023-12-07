import Ajv from 'ajv';
import { StatusBarAlignment, window } from 'vscode';
import { Success, Error, error, success } from './result';

export async function translate<T extends object>(option: {
  schema: string;
  request: string;
  createChatCompletion: (options: {
    messages: {
      role: 'system' | 'user' | 'assistant';
      content: string;
    }[];
    handleChunk?:
      | ((data: { text?: string; hasMore: boolean }) => void)
      | undefined;
    showWebview?: boolean;
  }) => Promise<string>;
  showWebview?: boolean;
  /**
   * @description 完整的 prompt，若提供则内部不再组合 prompt
   * @type {string}
   */
  completePrompt?: string;
  extendValidate?: (jsonObject: T) => Error | Success<T>;
}) {
  let requestPrompt =
    option.completePrompt ||
    `你是一个根据以下 JSON Schema 定义将用户请求转换为相应 JSON 数据的服务，并且按照 JSON Schema 中 description 的描述对字段进行处理:\n` +
      `\`\`\`\n${option.schema}\`\`\`\n` +
      `The following is a user request:\n` +
      `"""\n${option.request}\n"""\n` +
      `The following is the user request translated into a JSON data with 2 spaces of indentation and no properties with the value undefined:\n`;
  let tryCount = 0;
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
        showWebview: option.showWebview,
      })
      .finally(() => {
        statusBarItem.hide();
        statusBarItem.dispose();
      });
    let validation = validate<T>(
      responseText.replace(/```/g, ''),
      option.schema,
    );
    if (validation.success) {
      // 走额外的校验
      if (option.extendValidate) {
        validation = option.extendValidate(validation.data);
        if (validation.success) {
          return validation;
        }
      } else {
        return validation;
      }
    }
    if (tryCount > 3) {
      return validation;
    }
    requestPrompt += `${responseText}\n${createRepairPrompt(
      validation.message,
    )}`;
    tryCount++;
  }
}

function createRepairPrompt(validationError: string) {
  return (
    `The JSON object is invalid for the following reason:\n` +
    `"""\n${validationError}\n"""\n` +
    `The following is a revised JSON object:\n`
  );
}

function validate<T extends object>(jsonText: string, schema: string) {
  let jsonObject;
  try {
    jsonObject = JSON.parse(jsonText) as object;
  } catch (e) {
    return error(e instanceof SyntaxError ? e.message : 'JSON parse error');
  }
  stripNulls(jsonObject);
  const ajv = new Ajv();
  const jsonValidate = ajv.compile(JSON.parse(schema));
  const valid = jsonValidate(jsonObject);
  if (!valid) {
    console.log(jsonValidate.errors);
    return error(
      jsonValidate.errors?.map((s) => s.message || s.keyword).join(',') || '',
    );
  }
  return success<T>(jsonObject);
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
