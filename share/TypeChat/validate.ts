export interface TypeChatJsonValidator<T extends object> {
  schema: string;
  typeName: string;
  stripNulls: boolean;
  createModuleTextFromJson(
    jsonObject: object,
  ): { success: true; data: T } | { success: false; message: string };
  validate(
    jsonText: string,
  ): { success: true; data: T } | { success: false; message: string };
}
