"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const Content = (props) => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [`import request from "@/utils/request";`, props.api && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ["// #region ", props.api.title, props.type, (props.api.req_query.length > 0 ||
                    props.api.req_params.length > 0 ||
                    props.api.query_path.params.length > 0) && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [`export interface I${props.funcName
                            .slice(0, 1)
                            .toUpperCase()}${props.funcName.slice(1)}Params {`, (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [props.api.req_query
                                    .filter((query) => query.name !== props.pagination.page &&
                                    query.name !== props.pagination.size)
                                    .map((query) => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [query.name, "?: string;"] }))), props.api.req_params
                                    .filter((query) => query.name !== props.pagination.page &&
                                    query.name !== props.pagination.size)
                                    .map((query) => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [query.name, "?: string;"] }))), props.api.query_path.params
                                    .filter((query) => query.name !== props.pagination.page &&
                                    query.name !== props.pagination.size)
                                    .map((query) => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [query.name, "?: string;"] }))), props.pagination.show && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [props.pagination.page, ": number;", props.pagination.size, ": number;"] }))] }), `}`] })), props.requestBodyType &&
                    props.api.req_body_other.indexOf('{}') < 0 && ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: props.requestBodyType })), "// #endregion"] }))] }));
exports.default = Content;
