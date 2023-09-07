import { Result, error } from './result';
import { TypeChatJsonValidator, createJsonValidator } from './validate';

export interface TypeChatJsonTranslator<T extends object> {
  validator: TypeChatJsonValidator<T>;
  attemptRepair: boolean;
  stripNulls: boolean;
  createRequestPrompt(request: string): string;
  createRepairPrompt(validationError: string): string;
  translate(request: string): Promise<Result<T>>;
}

export function createJsonTranslator<T extends object>(
  schema: string,
  typeName: string,
): TypeChatJsonTranslator<T> {
  const validator = createJsonValidator<T>(schema, typeName);

  const typeChat: TypeChatJsonTranslator<T> = {
    validator,
    attemptRepair: true,
    stripNulls: false,
    createRequestPrompt,
    createRepairPrompt,
    translate,
  };

  return typeChat;

  function createRequestPrompt(request: string) {
    return (
      `You are a service that translates user requests into JSON objects of type "${validator.typeName}" according to the following TypeScript definitions:\n` +
      `\`\`\`\n${validator.schema}\`\`\`\n` +
      `The following is a user request:\n` +
      `"""\n${request}\n"""\n` +
      `The following is the user request translated into a JSON object with 2 spaces of indentation and no properties with the value undefined:\n`
    );
  }

  function createRepairPrompt(validationError: string) {
    return (
      `The JSON object is invalid for the following reason:\n` +
      `"""\n${validationError}\n"""\n` +
      `The following is a revised JSON object:\n`
    );
  }

  async function translate(request: string) {
    const prompt = typeChat.createRequestPrompt(request);
    const { attemptRepair } = typeChat;
    return error(`todo`);
    // while (true) {
    //   const response = await model.complete(prompt);
    //   if (!response.success) {
    //     return response;
    //   }
    //   const responseText = response.data;
    //   const startIndex = responseText.indexOf('{');
    //   const endIndex = responseText.lastIndexOf('}');
    //   if (!(startIndex >= 0 && endIndex > startIndex)) {
    //     return error(`Response is not JSON:\n${responseText}`);
    //   }
    //   const jsonText = responseText.slice(startIndex, endIndex + 1);
    //   const validation = validator.validate(jsonText);
    //   if (validation.success) {
    //     return validation;
    //   }
    //   if (!attemptRepair) {
    //     return error(
    //       `JSON validation failed: ${validation.message}\n${jsonText}`,
    //     );
    //   }
    //   prompt += `${responseText}\n${typeChat.createRepairPrompt(
    //     validation.message,
    //   )}`;
    //   attemptRepair = false;
    // }
  }
}
