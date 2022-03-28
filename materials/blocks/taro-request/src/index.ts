import * as Taro from "@tarojs/taro";
import * as queryString from "query-string";
import { baseUrl } from "./config";
import interceptors from "./interceptors";

interceptors.forEach((interceptorItem) => Taro.addInterceptor(interceptorItem));

interface OptionsType {
  method: "GET" | "POST" | "PUT" | "DELETE";
  params?: Object;
  data?: Object;
  noLoading?: boolean;
}
export const request = <T = any>(
  url: string,
  options: OptionsType = {
    method: "GET",
    params: {},
    data: {},
    noLoading: false,
  }
) => {
  if (!options.noLoading) {
    Taro.showLoading({
      title: "加载中",
    });
  }
  for (const key in options.data) {
    if (
      options.data.hasOwnProperty(key) &&
      (options.data[key] === undefined || options.data[key] == null)
    ) {
      delete options.data[key];
    }
  }
  const urlWithParms =
    url.indexOf("?") > -1
      ? `${url}&${queryString.stringify(options.params)}`
      : `${url}?${queryString.stringify(options.params)}`;
  return Taro.request<T>({
    url:
      urlWithParms.indexOf("http") === -1
        ? `${baseUrl}${urlWithParms}`
        : urlWithParms,
    data: {
      ...options.data,
    },
    header: {
      // "X-Token": Taro.getStorageSync("token"),
      "Content-Type": "application/json",
    },
    method: options.method.toUpperCase() as any,
  })
    .then((res) => {
      return res.data;
    })
    .finally(() => {
      setTimeout(() => {
        Taro.hideLoading();
      }, 100);
    });
};
