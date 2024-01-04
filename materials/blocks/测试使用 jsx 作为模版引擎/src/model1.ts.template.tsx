import React from 'react';

interface IProps {
  api?: object;
  funcName: string;
  fetchName: string;
  title: string;
  columns: { title: string; key: string }[];
  filters: { key: string; label: string; component: string }[];
  result: string;
  pagination: { show: boolean };
}

const Content: React.FC<IProps> = (props) => (
  <>
    {`import { reactive, ref } from "vue";`}
    {props.api &&
      `import { I${
        props.funcName.slice(0, 1).toUpperCase() + props.funcName.slice(1)
      }Result } from "./api";`}
    {!props.api &&
      `import { I${
        props.fetchName.slice(0, 1).toUpperCase() + props.fetchName.slice(1)
      }Result } from "./api";`}
    {!props.api && (
      <>
        {`interface ITableListItem {`}
        {props.columns.map((item, index) => (
          <>
            {`/** 
						* ${item.title}
				    */
					 `}
            {item.key || `column${index + 1}`}: string;
          </>
        ))}
        {`
				/**
				 * 接口返回的数据，新增字段不需要改 ITableListItem 直接从这里取
				 */
				`}
        {`apiResult: I${props.fetchName
          .slice(0, 1)
          .toUpperCase()}${props.fetchName.slice(1)}Result${props.result}[0]`}
        {`}`}
      </>
    )}
    {`interface IFormData {`}
    {props.filters.map((item) => (
      <>
        {`/**
					* ${item.label}
					*/
				`}
        {item.component === 'range-picker' && `${item.key}?: string[];`}
        {item.component !== 'range-picker' && `${item.key}?: string;`}
      </>
    ))}
    {`}`}
    {props.filters.some((s) => s.component === 'select') && (
      <>
        {`interface IOptionItem {
						label: string;
						value: string;
					}`}
        {`interface IOptions {`}
        {props.filters
          .filter((s) => s.component === 'select')
          .map((item) => (
            <>{`${item.key}: IOptionItem[],`}</>
          ))}
        {`}`}
        {`const defaultOptions: IOptions = {`}
        {props.filters
          .filter((s) => s.component === 'select')
          .map((item) => (
            <>{`${item.key}: [],`}</>
          ))}
        {`};`}
      </>
    )}
    {`;export const defaultFormData: IFormData = {`}
    {props.filters.map((item) => (
      <>{`${item.key}: undefined,`}</>
    ))}
    {`}`}
    {`;export const useModel = () => {`}
    {`const filterForm = reactive<IFormData>({ ...defaultFormData });`}
    {props.filters.some((s) => s.component === 'select') && (
      <>{`const options = reactive<IOptions>({ ...defaultOptions });`}</>
    )}
    {props.api && (
      <>
        {`
			const tableList = ref<(I${props.funcName
        .slice(0, 1)
        .toUpperCase()}${props.funcName.slice(1)}Result${
        props.result
      }[0] & { _?: unknown })[]>(
				[],
			);
		`}
      </>
    )}
    {!props.api && (
      <>
        {`
			const tableList = ref<(ITableListItem & { _?: unknown })[]>(
				[],
			);
		`}
      </>
    )}
    {props.pagination.show && (
      <>
        {`
			const pagination = reactive<{
				page: number;
				pageSize: number;
				total: number;
			}>({
				page: 1,
				pageSize: 10,
				total: 0,
			});
		`}
      </>
    )}
    {`
		const loading = reactive<{ list: boolean }>({
			list: false,
		});
		`}
    {`return {`}
    filterForm,
    {props.filters.some((s) => s.component === 'select') && `options,`}
    tableList,
    {props.pagination.show && `pagination,`}
    loading,
    {`}`}
    {`};`}
    {`export type Model = ReturnType <typeof useModel>;`}
  </>
);

export default Content;
