const gemini = require('../dist/share/LLM/gemini');

module.exports = {
  /**
   * @description
   * @param {({
   *   messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
   *   handleChunk?: (data: { text?: string; hasMore: boolean }) => void;
   * })} options
   * @returns {Promise<string>}
   */
  createChatCompletion: async (options) => {
    if (options.handleChunk) {
      const res = await gemini.createChatCompletion({
        messages: options.messages,
        model: 'gemini-pro',
        apiKey: '',
        handleChunk(data) {
          options.handleChunk(data);
        },
        proxyUrl: 'http://127.0.0.1:7890',
      });
      return res;
    }
  },
};
