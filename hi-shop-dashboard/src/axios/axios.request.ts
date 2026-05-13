import { InternalAxiosRequestConfig } from "axios";
import { getAccessToken } from "./axios.helper";

const PUBLIC_ROUTES: string[] = ["/auth/login", "/auth/forgot-password"];

const isPublicRoute = (url: string = ""): boolean =>
  PUBLIC_ROUTES.some((route) => url.startsWith(route));

const onRequest = (
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig => {
  if (!isPublicRoute(config.url)) {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
};

const onRequestError = (error: unknown): Promise<never> =>
  Promise.reject(error);

const request = { onRequest, onRequestError };

export default request;
