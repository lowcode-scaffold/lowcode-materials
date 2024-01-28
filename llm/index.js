module.exports = {
  /**
   * @description
   * @param {({
   *   messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
   *   handleChunk?: (data: { text?: string; hasMore: boolean }) => void;
   * })} options
   * @returns {Promise<string>}
   */
  createChatCompletion: (options) => {
    if (options.handleChunk) {
      options.handleChunk({ text: 'hahaha', hasMore: false });
      return Promise.resolve('hahaha');
    }
  },
};
