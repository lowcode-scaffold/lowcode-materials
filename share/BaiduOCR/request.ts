import axios, { AxiosRequestConfig } from 'axios';

const instance = axios.create({
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
      access_token:
        '24.3195599ffa4d3f13183d6ee2b203047e.2592000.1707361359.282335-39735241',
    },
  }),
  (error) => Promise.reject(error),
);

// 响应拦截
instance.interceptors.response.use(
  (res) => {
    if (res.data && res.data.error_msg) {
      return Promise.reject(res.data.error_msg);
    }
    return Promise.resolve(res.data);
  },
  (error) => Promise.reject(error),
);

type Request = <T = unknown>(config: AxiosRequestConfig) => Promise<T>;

export const request = instance.request as Request;
