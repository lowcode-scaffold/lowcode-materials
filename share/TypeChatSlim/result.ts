export type Success<T> = { success: true; data: T };

export type Error = { success: false; message: string };

export type Result<T> = Success<T> | Error;

export function success<T>(data: T): Success<T> {
  return { success: true, data };
}

export function error(message: string): Error {
  return { success: false, message };
}

export function getData<T>(result: Result<T>) {
  if (result.success) {
    return result.data;
  }
  throw new Error(result.message);
}
