import React from 'react';

interface IProps {
  api?: {
    title: string;
    req_query: { name: string }[];
    req_params: { name: string }[];
    query_path: { params: { name: string }[] };
    req_body_other: string;
  };
  requestBodyType: string;
  type: string;
  funcName: string;
  fetchName: string;
  title: string;
  columns: { title: string; key: string }[];
  filters: { key: string; label: string; component: string }[];
  result: string;
  pagination: { show: boolean; page: string; size: string };
}

const Content: React.FC<IProps> = (props) => (
  <>
    {`import request from "@/utils/request";`}
    {props.api && (
      <>
        // #region {props.api.title}
        {props.type}
        {(props.api.req_query.length > 0 ||
          props.api.req_params.length > 0 ||
          props.api.query_path.params.length > 0) && (
          <>
            {`export interface I${props.funcName
              .slice(0, 1)
              .toUpperCase()}${props.funcName.slice(1)}Params {`}
            <>
              {props.api.req_query
                .filter(
                  (query) =>
                    query.name !== props.pagination.page &&
                    query.name !== props.pagination.size,
                )
                .map((query) => (
                  <>{query.name}?: string;</>
                ))}
              {props.api.req_params
                .filter(
                  (query) =>
                    query.name !== props.pagination.page &&
                    query.name !== props.pagination.size,
                )
                .map((query) => (
                  <>{query.name}?: string;</>
                ))}
              {props.api.query_path.params
                .filter(
                  (query) =>
                    query.name !== props.pagination.page &&
                    query.name !== props.pagination.size,
                )
                .map((query) => (
                  <>{query.name}?: string;</>
                ))}
              {props.pagination.show && (
                <>
                  {props.pagination.page}: number;
                  {props.pagination.size}: number;
                </>
              )}
            </>
            {`}`}
          </>
        )}
        {props.requestBodyType &&
          props.api.req_body_other.indexOf('{}') < 0 && (
            <>{props.requestBodyType}</>
          )}
        // #endregion
      </>
    )}
  </>
);

export default Content;
