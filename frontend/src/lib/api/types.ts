import type { AxiosRequestConfig } from "axios";

export type ResponseDecoder<T> = (value: unknown) => T;

export type ApiRequest<T> = Omit<
  AxiosRequestConfig,
  "baseURL" | "data" | "url" | "withCredentials"
> & {
  body?: AxiosRequestConfig["data"];
  decode: ResponseDecoder<T>;
};
export interface ApiClient {
  request<T>(path: string, options: ApiRequest<T>): Promise<T>;
}
