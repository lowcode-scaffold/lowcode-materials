import { TypeChatJsonValidator } from './validate';

export interface TypeChatJsonTranslator<T extends object> {
  validator: TypeChatJsonValidator<T>;
  attemptRepair: boolean;
  stripNulls: boolean;
  createRequestPrompt(request: string): string;
  createRepairPrompt(validationError: string): string;
  translate(
    request: string,
  ): Promise<{ success: true; data: T } | { success: false; message: string }>;
}
