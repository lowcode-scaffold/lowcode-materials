// 请求连接前缀
export const baseUrl =
  process.env.NODE_ENV === "production"
    ? "https://xxx.com"
    : "http://localhost:8360";

// 输出日志信息
export const noConsole = false;
