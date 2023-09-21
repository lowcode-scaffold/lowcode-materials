export type IOption = { value: number; label: string }[];

export type IColumns = {
  /**
   * @description 不需要处理，原样输出
   * @type {string}
   */
  title: string;
  /**
   * @description 翻译成英文，驼峰语法
   * @type {string}
   */
  dataIndex: string;
  /**
   * @description 翻译成英文，驼峰语法
   * @type {string}
   */
  key: string;
  slot: boolean;
}[];
