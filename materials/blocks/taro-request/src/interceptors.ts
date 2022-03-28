import * as Taro from "@tarojs/taro";

const HTTP_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  ACCEPTED: 202,
  CLIENT_ERROR: 400,
  AUTHENTICATE: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};

const rspInterceptor: Taro.interceptor = (chain) => {
  const { requestParams } = chain;

  return chain.proceed(requestParams).then((res) => {
    if (res.statusCode === HTTP_STATUS.BAD_GATEWAY) {
      return Promise.reject("服务端出现了问题");
    }
    if (res.statusCode === HTTP_STATUS.FORBIDDEN) {
      return Promise.reject("没有权限访问");
    }
    if (res.statusCode === HTTP_STATUS.AUTHENTICATE) {
      return Promise.reject("需要鉴权");
    }
    if (res.statusCode === HTTP_STATUS.SUCCESS) {
      return res;
    }
  });
};

const interceptors = [rspInterceptor];

export default interceptors;
