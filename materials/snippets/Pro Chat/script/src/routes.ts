import * as controller from './controller';

export const routes: Record<string, any> = {
  askGemini: controller.askGemini,
  askChatGPT: controller.askChatGPT,
};
