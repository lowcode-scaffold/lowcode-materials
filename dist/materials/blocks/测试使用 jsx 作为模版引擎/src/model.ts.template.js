"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const Content = (props) => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [`import { reactive, ref } from "vue";`, props.api &&
            `import { I${props.funcName.slice(0, 1).toUpperCase() + props.funcName.slice(1)}Result } from "./api";`, !props.api &&
            `import { I${props.fetchName.slice(0, 1).toUpperCase() + props.fetchName.slice(1)}Result } from "./api";`, !props.api && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [`interface ITableListItem {`, (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [props.columns.map((item, index) => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [`/** 
							* ${item.title}
							*/
						`, item.key || `column${index + 1}`, ": string;"] }))), (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [`
						/**
						 * 接口返回的数据，新增字段不需要改 ITableListItem 直接从这里取
						 */
						`, `apiResult: I${props.fetchName
                                        .slice(0, 1)
                                        .toUpperCase()}${props.fetchName.slice(1)}Result${props.result}[0]`] }) })] }), `}`] })), `interface IFormData {`, (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: props.filters.map((item) => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [`/**
					* ${item.label}
					*/
				`, item.component === 'range-picker' && `${item.key}?: string[];`, item.component !== 'range-picker' && `${item.key}?: string;`] }))) }), `}`, props.filters.some((s) => s.component === 'select') && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [`interface IOptionItem {
						label: string;
						value: string;
					}`, `interface IOptions {`, (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: props.filters
                        .filter((s) => s.component === 'select')
                        .map((item) => ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: `${item.key}: IOptionItem[],` }))) }), `}`, `const defaultOptions: IOptions = {`, (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: props.filters
                        .filter((s) => s.component === 'select')
                        .map((item) => ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: `${item.key}: [],` }))) }), `};`] })), `;export const defaultFormData: IFormData = {`, (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: props.filters.map((item) => ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: `${item.key}: undefined,` }))) }), `}`, `;export const useModel = () => {`, (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [`const filterForm = reactive<IFormData>({ ...defaultFormData });`, props.filters.some((s) => s.component === 'select') && ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: `const options = reactive<IOptions>({ ...defaultOptions });` })), props.api && ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: `
							const tableList = ref<(I${props.funcName
                            .slice(0, 1)
                            .toUpperCase()}${props.funcName.slice(1)}Result${props.result}[0] & { _?: unknown })[]>(
								[],
							);
						` })), !props.api && ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: `
							const tableList = ref<(ITableListItem & { _?: unknown })[]>(
								[],
							);
						` })), props.pagination.show && ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: `
							const pagination = reactive<{
								page: number;
								pageSize: number;
								total: number;
							}>({
								page: 1,
								pageSize: 10,
								total: 0,
							});
						` })), `
					const loading = reactive<{ list: boolean }>({
						list: false,
					});
				`, `return {`, (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ["filterForm,", props.filters.some((s) => s.component === 'select') && `options,`, "tableList,", props.pagination.show && `pagination,`, "loading,"] }), `}`] }) }), `};`, `export type Model = ReturnType <typeof useModel>;`] }));
exports.default = Content;
