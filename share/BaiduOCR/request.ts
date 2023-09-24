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
        '24.3acf43086b755015f1666848928cfc41.2592000.1698138970.282335-39735241',
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
