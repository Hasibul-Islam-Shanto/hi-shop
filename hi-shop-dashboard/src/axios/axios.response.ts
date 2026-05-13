import {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { clearTokens, memoizedRefreshToken } from "./axios.helper";
import { useAuthStore } from "@/shared/store/useAuthStore";

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const createResponseInterceptor = (instance: AxiosInstance) => {
  const onResponse = (response: AxiosResponse): AxiosResponse => response;

  const onResponseError = async (error: AxiosError): Promise<unknown> => {
    const original = error.config as RetryableRequest | undefined;

    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !original.url?.includes("/auth/refresh") &&
      !original.url?.includes("/auth/login")
    ) {
      original._retry = true;

      const newToken = await memoizedRefreshToken().catch(() => null);

      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return instance.request(original);
      }

      clearTokens();
      useAuthStore.getState().logout();
    }

    return Promise.reject(error);
  };

  return { onResponse, onResponseError };
};
