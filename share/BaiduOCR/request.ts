import axios, { AxiosRequestConfig } from 'axios';

const instance = axios.create({
  timeout: 30 * 1000,
});

// 请求拦截
instance.interceptors.request.use(
  // @ts-ignore
  async (config) => {
    let token = '';
    if (!config.url?.includes('/oauth/2.0/token')) {
      token = await getAccessToken();
    }
    return {
      ...config,
      headers: {
        ...config.headers,
        'content-type': 'application/x-www-form-urlencoded',
      },
      params: {
        ...config.params,
        access_token: token,
      },
    };
  },
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

const getAccessToken = async () => {
  const res = await request<{ access_token: string }>({
    url: 'https://aip.baidubce.com/oauth/2.0/token',
    method: 'POST',
    params: {
      client_id: 'xxxxx',
      client_secret: 'xxxxxxxx',
      grant_type: 'client_credentials',
    },
  });
  return res.access_token;
};
