export type IColumns = {
  /**
   * @description 保持原始内容，不需要处理，不要翻译
   * @type {string}
   */
  title: string;
  /**
   * @description 翻译成英文，驼峰格式
   * @type {string}
   */
  dataIndex: string;
  /**
   * @description 翻译成英文，驼峰格式
   * @type {string}
   */
  key: string;
  slots: {
    /**
     * @description 翻译成英文，驼峰格式
     * @type {string}
     */
    customRender: string;
  };
}[];
