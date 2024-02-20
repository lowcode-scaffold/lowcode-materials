"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.request = void 0;
const axios_1 = __importDefault(require("axios"));
const instance = axios_1.default.create({
    timeout: 30 * 1000,
});
// 请求拦截
instance.interceptors.request.use(
// @ts-ignore
(config) => ({
    ...config,
    headers: {
        ...config.headers,
        'content-type': 'application/x-www-form-urlencoded',
    },
    params: {
        ...config.params,
        access_token: '24.3195599ffa4d3f13183d6ee2b203047e.2592000.1707361359.282335-39735241',
    },
}), (error) => Promise.reject(error));
// 响应拦截
instance.interceptors.response.use((res) => {
    if (res.data && res.data.error_msg) {
        return Promise.reject(res.data.error_msg);
    }
    return Promise.resolve(res.data);
}, (error) => Promise.reject(error));
exports.request = instance.request;
