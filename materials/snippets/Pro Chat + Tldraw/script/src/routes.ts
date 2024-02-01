import * as controller from './controller';

export const routes: Record<string, any> = {
  getMaterialPath: controller.getMaterialPath,
  askGemini: controller.askGemini,
  askChatGPT: controller.askChatGPT,
};
