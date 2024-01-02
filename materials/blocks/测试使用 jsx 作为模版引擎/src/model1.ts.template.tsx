import React from 'react';

interface IProps {
  api?: object;
  funcName: string;
  fetchName: string;
  title: string;
  columns: { title: string; key: string }[];
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
        {`}`}
      </>
    )}
    {`export type Model = ReturnType <typeof useModel>;`}
  </>
);

export default Content;
