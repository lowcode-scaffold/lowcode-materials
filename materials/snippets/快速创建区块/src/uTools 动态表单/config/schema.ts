export type PageConfig = {
  filters: {
    component: string;
    /**
     * @description 翻译成英文，驼峰格式
     * @type {string}
     */
    key: string;
    /**
     * @description 保持原始内容，不要翻译
     * @type {string}
     */
    label: string;
    /**
     * @description 保持原始内容，不要翻译
     * @type {string}
     */
    placeholder: string;
  }[];
  columns: {
    slot: boolean;
    /**
     * @description 保持原始内容，不要翻译
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
  }[];
  pagination: {
    show: boolean;
    page: string;
    size: string;
    total: string;
  };
  includeModifyModal: boolean;
  fetchName: string;
  result: string;
  serviceName: string;
};
